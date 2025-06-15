'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Video, VideoOff, Mic, MicOff, Phone, Monitor, Settings, Users, MessageCircle } from 'lucide-react';

export default function VideoCallPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Initialize camera on component mount
  useEffect(() => {
    initializeCamera();

    // Cleanup function to stop camera when component unmounts
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Update video element when stream changes
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false // We'll handle audio separately if needed
      });
      setVideoStream(stream);
      setCameraError(null);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please check permissions.');
      setIsCameraOn(false);
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      setVideoStream(stream);
      setCameraError(null);
    } catch (error) {
      console.error('Error starting camera:', error);
      setCameraError('Unable to start camera. Please check permissions.');
    }
  };

  // Fake call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDisconnect = () => {
    // Stop camera before leaving
    stopCamera();
    // Redirect back to messages or home
    router.push('/messages');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleCamera = async () => {
    if (isCameraOn) {
      // Turn off camera
      stopCamera();
      setIsCameraOn(false);
    } else {
      // Turn on camera
      await startCamera();
      setIsCameraOn(true);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 text-white">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Interview Call - John Employer</h1>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>{formatDuration(callDuration)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isRecording && (
            <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Recording</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-sm text-gray-300">
            <Users className="w-4 h-4" />
            <span>2 participants</span>
          </div>
        </div>
      </div>

      {/* Main video area */}
      <div className="flex-1 relative p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Remote participant video */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-24 h-24 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold">JE</span>
              </div>
              <h3 className="text-xl font-semibold">John Employer</h3>
              <p className="text-gray-300">Software Engineer Manager</p>
            </div>
          </div>
          
          {/* Participant info overlay */}
          <div className="absolute bottom-4 left-4 bg-black/50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 text-white">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">John Employer</span>
              <Mic className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Local video (you) - Real camera feed */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden">
          <div className="aspect-video relative">
            {isCameraOn && videoStream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <VideoOff className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg">Camera Off</p>
                  {cameraError && (
                    <p className="text-sm text-red-400 mt-2">{cameraError}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Local video controls overlay */}
          <div className="absolute bottom-4 left-4 bg-black/50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 text-white">
              <div className={`w-2 h-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className="text-sm font-medium">You</span>
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </div>
          </div>

          {/* Camera status indicator */}
          <div className="absolute top-4 right-4 bg-black/50 rounded-lg px-2 py-1">
            <div className="flex items-center gap-1 text-white text-xs">
              {isCameraOn && videoStream ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Live</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Off</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Control panel */}
      <div className="bg-gray-800 p-6">
        <div className="flex items-center justify-center gap-4">
          {/* Microphone toggle */}
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all duration-200 ${
              isMuted 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Camera toggle */}
          <button
            onClick={toggleCamera}
            className={`p-4 rounded-full transition-all duration-200 ${
              !isCameraOn 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isCameraOn ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Screen share */}
          <button
            className="p-4 rounded-full bg-gray-600 hover:bg-gray-700 transition-all duration-200"
            title="Share screen"
          >
            <Monitor className="w-6 h-6 text-white" />
          </button>

          {/* Recording toggle */}
          <button
            onClick={toggleRecording}
            className={`p-4 rounded-full transition-all duration-200 ${
              isRecording 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            <div className={`w-6 h-6 ${isRecording ? 'bg-white rounded-sm' : 'bg-white rounded-full'}`}></div>
          </button>

          {/* Chat */}
          <button
            className="p-4 rounded-full bg-gray-600 hover:bg-gray-700 transition-all duration-200"
            title="Open chat"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </button>

          {/* Settings */}
          <button
            className="p-4 rounded-full bg-gray-600 hover:bg-gray-700 transition-all duration-200"
            title="Settings"
          >
            <Settings className="w-6 h-6 text-white" />
          </button>

          {/* Disconnect call */}
          <button
            onClick={handleDisconnect}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200 ml-4"
            title="End call"
          >
            <Phone className="w-6 h-6 text-white rotate-[135deg]" />
          </button>
        </div>

        {/* Call info */}
        <div className="mt-4 text-center text-gray-400 text-sm">
          <p>Meeting ID: 123-456-789 | End-to-end encrypted</p>
        </div>
      </div>

      {/* Connection status */}
      <div className="absolute top-20 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span>Connected</span>
      </div>
    </div>
  );
} 