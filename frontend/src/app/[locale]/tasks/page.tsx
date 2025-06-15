'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Code, 
  FileText, 
  Lightbulb,
  RotateCcw,
  Send,
  Eye,
  EyeOff
} from 'lucide-react';

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

interface Task {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: { input: string; output: string; explanation?: string; }[];
  constraints: string[];
  testCases: TestCase[];
  starterCode: string;
  timeLimit: number; // in minutes
}

export default function InterviewTaskPage() {
  const [currentTask] = useState<Task>({
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]"
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]"
      }
    ],
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹", 
      "-10⁹ ≤ target ≤ 10⁹",
      "Only one valid answer exists."
    ],
    testCases: [
      { input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
      { input: "[3,2,4], 6", expectedOutput: "[1,2]" },
      { input: "[3,3], 6", expectedOutput: "[0,1]" },
      { input: "[1,2,3,4,5], 9", expectedOutput: "[3,4]", isHidden: true },
      { input: "[-1,-2,-3,-4,-5], -8", expectedOutput: "[2,4]", isHidden: true }
    ],
    starterCode: `function twoSum(nums, target) {
    // Write your code here
    
}`,
    timeLimit: 45
  });

  const [code, setCode] = useState(currentTask.starterCode);
  const [timeLeft, setTimeLeft] = useState(currentTask.timeLimit * 60); // Convert to seconds
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean; input: string; expected: string; actual: string; }[]>([]);
  const [showHiddenTests, setShowHiddenTests] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const runTests = () => {
    // Simulate running tests (in real implementation, this would execute the code)
    const results = currentTask.testCases.map((testCase, index) => {
      // Mock results - in real implementation, would execute user's code
      const mockResults = [
        { passed: true, actual: "[0,1]" },
        { passed: true, actual: "[1,2]" },
        { passed: true, actual: "[0,1]" },
        { passed: false, actual: "[4,3]" }, // Wrong order for hidden test
        { passed: true, actual: "[2,4]" }
      ];
      
      const result = mockResults[index] || { passed: false, actual: "Runtime Error" };
      
      return {
        passed: result.passed,
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual: result.actual
      };
    });
    
    setTestResults(results);
  };

  const submitSolution = () => {
    runTests();
    setSubmitted(true);
    setIsRunning(false);
  };

  const resetCode = () => {
    setCode(currentTask.starterCode);
    setTestResults([]);
    setSubmitted(false);
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;

  return (
    <div className="min-h-screen bg-bgc">
      {/* Header */}
      <div className="bg-componentbgc border-b border-textc/10 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-textc">Technical Interview</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentTask.difficulty)}`}>
              {currentTask.difficulty}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
            
            {!isRunning && !submitted && (
              <button 
                onClick={startTimer}
                className="bg-primaryc text-white px-4 py-2 rounded-lg hover:bg-primaryc/90 transition-colors"
              >
                Start Timer
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-80px)]">
        {/* Problem Description */}
        <div className="bg-componentbgc rounded-lg border border-textc/10 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-textc/10">
            <h2 className="text-lg font-semibold text-textc mb-2">{currentTask.title}</h2>
            <div className="prose prose-sm max-w-none text-textc/80">
              <p className="whitespace-pre-line">{currentTask.description}</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Examples */}
            <div>
              <h3 className="font-semibold text-textc mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Examples
              </h3>
              <div className="space-y-4">
                {currentTask.examples.map((example, index) => (
                  <div key={index} className="bg-bgc p-3 rounded-lg border border-textc/10">
                    <div className="mb-2">
                      <strong className="text-textc">Input:</strong>
                      <code className="ml-2 bg-gray-700 text-gray-100 px-2 py-1 rounded text-sm">{example.input}</code>
                    </div>
                    <div className="mb-2">
                      <strong className="text-textc">Output:</strong>
                      <code className="ml-2 bg-gray-700 text-gray-100 px-2 py-1 rounded text-sm">{example.output}</code>
                    </div>
                    {example.explanation && (
                      <div className="text-textc/70 text-sm">
                        <strong>Explanation:</strong> {example.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Constraints */}
            <div>
              <h3 className="font-semibold text-textc mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Constraints
              </h3>
              <ul className="list-disc list-inside text-textc/80 space-y-1">
                {currentTask.constraints.map((constraint, index) => (
                  <li key={index} className="text-sm">{constraint}</li>
                ))}
              </ul>
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-textc flex items-center gap-2">
                    Test Results ({passedTests}/{totalTests} passed)
                  </h3>
                  <button
                    onClick={() => setShowHiddenTests(!showHiddenTests)}
                    className="flex items-center gap-1 text-sm text-primaryc hover:text-primaryc/80"
                  >
                    {showHiddenTests ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showHiddenTests ? 'Hide' : 'Show'} Hidden Tests
                  </button>
                </div>
                <div className="space-y-2">
                  {testResults.map((result, index) => {
                    const testCase = currentTask.testCases[index];
                    if (testCase.isHidden && !showHiddenTests) return null;
                    
                    return (
                      <div key={index} className={`p-3 rounded-lg border ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {result.passed ? 
                            <CheckCircle className="w-4 h-4 text-green-600" /> : 
                            <XCircle className="w-4 h-4 text-red-600" />
                          }
                          <span className="text-sm font-medium">
                            Test Case {index + 1} {testCase.isHidden ? '(Hidden)' : ''}
                          </span>
                        </div>
                        <div className="text-xs space-y-1">
                          <div><strong>Input:</strong> {result.input}</div>
                          <div><strong>Expected:</strong> {result.expected}</div>
                          <div><strong>Actual:</strong> {result.actual}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Code Editor */}
        <div className="bg-componentbgc rounded-lg border border-textc/10 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-textc/10 flex items-center justify-between">
            <h3 className="font-semibold text-textc flex items-center gap-2">
              <Code className="w-4 h-4" />
              Solution
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={resetCode}
                className="flex items-center gap-1 px-3 py-1 text-sm border border-textc/20 rounded hover:bg-textc/5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={runTests}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Play className="w-4 h-4" />
                Run Tests
              </button>
              <button
                onClick={submitSolution}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                Submit
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-4">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg border border-textc/10 resize-none focus:outline-none focus:ring-2 focus:ring-primaryc"
              placeholder="Write your solution here..."
              style={{ minHeight: '400px' }}
            />
          </div>

          {/* Status Bar */}
          <div className="p-3 border-t border-textc/10 bg-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-300">
              <div className="flex items-center gap-4">
                <span>Language: JavaScript</span>
                <span>Lines: {code.split('\n').length}</span>
              </div>
              {submitted && (
                <div className={`flex items-center gap-1 ${passedTests === totalTests ? 'text-green-400' : 'text-red-400'}`}>
                  {passedTests === totalTests ? 
                    <CheckCircle className="w-4 h-4" /> : 
                    <XCircle className="w-4 h-4" />
                  }
                  <span>{passedTests === totalTests ? 'All tests passed!' : `${passedTests}/${totalTests} tests passed`}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 