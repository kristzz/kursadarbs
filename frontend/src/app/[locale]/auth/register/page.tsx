"use client"

import { useTranslations } from "next-intl";
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Dropdown from '../../../../components/profesionDropdown';
import CountryDropdown from '../../../../components/countryDropdown';
import { register } from '../../../../services/auth';

export default function Home() {
    const t = useTranslations("Register");
    const router = useRouter();
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Existing state
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedPurpose, setSelectedPurpose] = useState("");
    const [selectedSource, setSelectedSource] = useState("");
    const [selectedProfession, setSelectedProfession] = useState(t("selectProfession"));
    const [isAgreed, setIsAgreed] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError(t('passwordsDoNotMatch'));
            setLoading(false);
            return;
        }

        // Validate all required fields
        if (!selectedCountry || !selectedProfession || !selectedPurpose || !selectedSource) {
            setError(t('allFieldsRequired'));
            setLoading(false);
            return;
        }

        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                country: selectedCountry,
                profession: selectedProfession,
                purpose: selectedPurpose === t('findWork') ? 'findWork' : 'provideWork',
                source: selectedSource
            });

            // Redirect to dashboard on success
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || t('registrationFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <main className="flex flex-col sm:items-left justify-center gap-8 w-full max-w-[90%] sm:max-w-[80%] mx-auto">
            <h1 className="text-center w-full sm:text-left">{t("title")}</h1>
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                        <h3 className="w-[193px]">{t("nameis")}</h3>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder={t("enterName")}
                            required
                            className="bg-transparent border-b border-white focus:border-primaryc focus:outline-none"
                        />
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                        <h3 className="w-[100px] lg:ml-4">{t("from")}</h3>
                        <CountryDropdown
                            selected={selectedCountry}
                            setSelected={setSelectedCountry}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                        <h3 className="w-[193px]">{t("availableAt")}</h3>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder={t("enterEmail")}
                            required
                            className="bg-transparent border-b border-white focus:border-primaryc focus:outline-none"
                        />
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                        <h3 className="sm:w-[558px]">{t("passwordLogin")}</h3>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder={t("enterPassword")}
                            required
                            className="bg-transparent border-b border-white focus:border-primaryc focus:outline-none"
                        />
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                        <h3 className="sm:w-[558px]">{t("confirmIt")}</h3>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder={t("confirmPassword")}
                            required
                            className="bg-transparent border-b border-white focus:border-primaryc focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:gap-0">
                    <h3 className="w-64">{t("specializeIn")}</h3>
                    <Dropdown
                        selected={selectedProfession}
                        setSelected={setSelectedProfession}
                        options={[t("programmer"), t("mechanic"), t("doctor")]}
                    />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-0">
                    <h3 className="sm:w-[24rem] flex-shrink-0">{t("tryingTo")}</h3>
                    <div className="flex gap-4">
                        {["findWork", "provideWork"].map((purpose) => (
                            <button
                                key={purpose}
                                type="button"
                                onClick={() => setSelectedPurpose(t(purpose))}
                                className={`border rounded-lg px-4 py-2 transition-colors ${selectedPurpose === t(purpose) ? "bg-primaryc text-white" : "bg-backgroundc hover:bg-primaryc/10"}`}
                            >
                                {t(purpose)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 md:gap-0">
                    <h3 className="sm:w-[24rem] flex-shrink-0">{t("heardFrom")}</h3>
                    <div className="flex flex-wrap gap-4">
                        {["google", "socialMedia", "friends", "ads"].map((source) => (
                            <button
                                key={source}
                                type="button"
                                onClick={() => setSelectedSource(t(source))}
                                className={`border rounded-lg px-4 py-2 transition-colors ${selectedSource === t(source) ? "bg-primaryc text-white" : "bg-backgroundc hover:bg-primaryc/10"}`}
                            >
                                {t(source)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={isAgreed}
                        onChange={() => setIsAgreed(!isAgreed)}
                        className="hidden peer"
                    />
                    <label
                        htmlFor="terms"
                        className="w-6 h-6 flex items-center justify-center border-2 border-white rounded-md cursor-pointer peer-checked:border-primaryc peer-checked:bg-primaryc"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`w-4 h-4 text-white ${isAgreed ? 'block' : 'hidden'}`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                    </label>
                    <label htmlFor="terms" className="text-sm">
                        {t("agreeTo")}{" "}
                        <a href="/terms-and-conditions" target="_blank" className="text-primaryc opacity-100 underline">
                            {t("terms")}
                        </a>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={!isAgreed || loading}
                    className={`bg-primaryc text-white px-6 py-3 rounded-lg transition-opacity 
                        ${(isAgreed && !loading) ? "opacity-100" : "opacity-50 cursor-not-allowed"}`}
                >
                    {loading ? t("submitting") : t("submit")}
                </button>
            </form>
        </main>
    );
}
