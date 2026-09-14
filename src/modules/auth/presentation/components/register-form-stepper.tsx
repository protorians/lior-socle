"use client"

import {cn} from "@sentients/sdk/infrastructure/utilities/utils"
import {Button} from "@sentients/sdk/presentation/ui/button"
import {FieldGroup} from "@sentients/sdk/presentation/ui/field"
import {LegacyBirthDateInput} from "@sentients/sdk/presentation/ui/legacy-birth-date-input"
import {LegacyInput} from "@sentients/sdk/presentation/ui/legacy-input"
import {LegacyPhoneInput} from "@sentients/sdk/presentation/ui/legacy-phone-input"
import {
    User,
    Mail,
    Eye,
    EyeOff,
    Phone,
    MapPin,
    Calendar,
    FileText,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Shield,
    Building,
} from "lucide-react"
import Link from "next/link"
import {useEffect, useState} from "react"
import {SignUpDataset} from "@sentients/sdk/infrastructure/dataset/sign-up.dataset"
import {Motion} from "@sentients/sdk/infrastructure/library/motion"
import {AuthApiService} from "@sentients/sdk/application/service/auth-api-service"
import {ApiService} from "@sentients/sdk/infrastructure/utilities/api-service"
import {toast} from "sonner"
import {
    Stepper,
    StepperItem,
    StepperTrigger,
    StepperIndicator,
    StepperSeparator,
    StepperNav,
    StepperPanel,
    StepperContent,
    StepperTitle,
    StepperDescription,
} from "@sentients/sdk/presentation/reui/stepper"
import {AuthConfig} from "@sentients/sdk/domain/config/auth.config";
import {WaitingActivity} from "@sentients/sdk/presentation/components/waiting-activity";

interface OTPResponse {
    id: string
    phone: string
    email: string
    channel: string
    expiredAt: string
}

export function RegisterFormStepper({className, ...props}: React.ComponentProps<"form">) {
    const {setter, getter, dataset, consolidate} = SignUpDataset()
    const [activeStep, setActiveStep] = useState(1)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [otpGenerated, setOtpGenerated] = useState(false)
    const [otpId, setOtpId] = useState<string | null>(null)
    const [otpLoading, setOtpLoading] = useState(false)

    // Validate step 1: Account info
    const validateStep1 = () => {
        if (!getter('first_names')) {
            toast.error("Prénom(s) requis")
            return false
        }
        if (!getter('last_name')) {
            toast.error("Nom requis")
            return false
        }
        if (!getter('organization')) {
            toast.error("organization requise")
            return false
        }
        if (!getter('email')) {
            toast.error("Email requis")
            return false
        }
        const re = /\S+@\S+\.\S+/
        if (!re.test(getter('email') || '')) {
            toast.error("Email invalide")
            return false
        }
        return true
    }

    // Validate step 2: Password
    const validateStep2 = () => {
        if (!getter('password')) {
            toast.error("Mot de passe requis")
            return false
        }
        if ((getter('password') || '').length < 6) {
            toast.error("Mot de passe trop court (minimum 6 caractères)")
            return false
        }
        if (!getter('password_confirmation')) {
            toast.error("Confirmation du mot de passe requise")
            return false
        }
        if (getter('password') !== getter('password_confirmation')) {
            toast.error("Les mots de passe ne correspondent pas")
            return false
        }
        return true
    }

    // Validate step 3: Contact info
    const validateStep3 = () => {
        if (!getter('phone')) {
            toast.error("Numéro de téléphone requis")
            return false
        }
        if (!/^\+?[0-9\s\-()]{10,}$/.test(getter('phone') || '')) {
            toast.error("Numéro de téléphone invalide")
            return false
        }
        return true
    }

    // Validate step 4: OTP
    const validateStep4 = () => {
        if (!getter('otp')) {
            toast.error("Code OTP requis")
            return false
        }
        return true
    }

    // Generate OTP
    const handleGenerateOTP = async () => {
        if (!validateStep3()) return

        setOtpLoading(true)
        try {
            const response = await ApiService.post('/otp/create', {
                phone: getter('phone'),
                email: getter('email'),
            })

            if (response.data) {
                setOtpId(response.data.id)
                setOtpGenerated(true)
                toast.success(`Code OTP envoyé via ${response.data.channel}`)
            }
        } catch (error) {
            console.error('OTP Error', error)
            toast.error("Erreur lors de la génération du code OTP")
        } finally {
            setOtpLoading(false)
        }
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!validateStep4()) return

        setLoading(true)
        try {
            const response = await AuthApiService.signUp({
                username: getter('username'),
                email: getter('email')!,
                password: getter('password')!,
                password_confirmation: getter('password_confirmation')!,
                first_names: getter('first_names'),
                last_name: getter('last_name'),
                organization: getter('organization'),
                phone: getter('phone'),
                otp: getter('otp'),
                country: getter('country'),
                city: getter('city'),
                address: getter('address'),
                gender: getter('gender'),
                birth_date: getter('birth_date'),
                idRecto: getter('idRecto'),
                idVerso: getter('idVerso'),
                selfie: getter('selfie'),
            })

            if (response.data) {
                toast.success("Compte créé avec succès!")
                setActiveStep(5) // Completion step
            }
        } catch (error) {
            console.error('Signup Error', error)
            toast.error("Erreur lors de la création du compte")
        } finally {
            setLoading(false)
        }
    }

    const handleNextStep = () => {
        if (activeStep === 1 && !validateStep1()) return
        if (activeStep === 2 && !validateStep2()) return
        if (activeStep === 3 && !validateStep3()) return
        setActiveStep(Math.min(activeStep + 1, 5))
    }

    const handlePrevStep = () => {
        setActiveStep(Math.max(activeStep - 1, 1))
    }

    return (
        <Motion
            animation={{
                from: {opacity: 0, x: 20},
                to: {opacity: 1, x: 0, duration: 0.3},
            }}
            className={cn("flex flex-col gap-6 w-full", className)}
        >
            <form onSubmit={handleSubmit} {...props}>
                <div className="flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex flex-col gap-1 text-left w-full">
            <span className="text-[10px] font-bold tracking-wider text-primary uppercase">
              Inscription multi-étapes
            </span>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">
                            Créer un compte<span className="text-primary">.</span>
                        </h1>
                        <p className="text-xs text-muted-foreground mt-1">
                            Déjà membre ?{" "}
                            <Link href={`${AuthConfig.routes.login}`}
                                  className="text-primary hover:underline font-semibold">
                                Se connecter
                            </Link>
                        </p>
                    </div>

                    {/* Stepper */}
                    <Stepper value={activeStep} onValueChange={setActiveStep} orientation="horizontal">
                        <StepperNav className="gap-0">
                            {/* Step 1 */}
                            <StepperItem step={1} completed={activeStep > 1}>
                                <StepperTrigger disabled={activeStep < 1} className="flex-col gap-1">
                                    <StepperIndicator>
                                        {activeStep > 1 ? <CheckCircle2 className="size-4"/> : "1"}
                                    </StepperIndicator>
                                    <div className="text-center hidden md:block">
                                        <StepperTitle className="text-xs md:text-xs">Identité</StepperTitle>
                                        <StepperDescription className="text-[10px]">
                                            Informations
                                        </StepperDescription>
                                    </div>
                                </StepperTrigger>
                                <StepperSeparator/>
                            </StepperItem>

                            {/* Step 2 */}
                            <StepperItem step={2} completed={activeStep > 2}>
                                <StepperTrigger disabled={activeStep < 2} className="flex-col gap-1">
                                    <StepperIndicator>
                                        {activeStep > 2 ? <CheckCircle2 className="size-4"/> : "2"}
                                    </StepperIndicator>
                                    <div className="text-center hidden md:block">
                                        <StepperTitle className="text-xs md:text-xs">Mot de passe</StepperTitle>
                                        <StepperDescription className="text-[10px]">
                                            Sécurité
                                        </StepperDescription>
                                    </div>
                                </StepperTrigger>
                                <StepperSeparator/>
                            </StepperItem>

                            {/* Step 3 */}
                            <StepperItem step={3} completed={activeStep > 3}>
                                <StepperTrigger disabled={activeStep < 3} className="flex-col gap-1">
                                    <StepperIndicator>
                                        {activeStep > 3 ? <CheckCircle2 className="size-4"/> : "3"}
                                    </StepperIndicator>
                                    <div className="text-center hidden md:block">
                                        <StepperTitle className="text-xs md:text-xs">Contact</StepperTitle>
                                        <StepperDescription className="text-[10px]">
                                            Téléphone
                                        </StepperDescription>
                                    </div>
                                </StepperTrigger>
                                <StepperSeparator/>
                            </StepperItem>

                            {/* Step 4 */}
                            <StepperItem step={4} completed={activeStep > 4}>
                                <StepperTrigger disabled={activeStep < 4} className="flex-col gap-1">
                                    <StepperIndicator>
                                        {activeStep > 4 ? <CheckCircle2 className="size-4"/> : "4"}
                                    </StepperIndicator>
                                    <div className="text-center hidden md:block">
                                        <StepperTitle className="text-xs md:text-xs">Vérification</StepperTitle>
                                        <StepperDescription className="text-[10px]">
                                            Code OTP
                                        </StepperDescription>
                                    </div>
                                </StepperTrigger>
                                <StepperSeparator/>
                            </StepperItem>

                            {/* Step 5 - Completion */}
                            <StepperItem step={5}>
                                <StepperTrigger disabled className="flex-col gap-1">
                                    <StepperIndicator>
                                        <CheckCircle2 className="size-4"/>
                                    </StepperIndicator>
                                    <div className="text-center hidden md:block">
                                        <StepperTitle className="text-xs md:text-xs">Confirmé</StepperTitle>
                                        <StepperDescription className="text-[10px]">
                                            Succès
                                        </StepperDescription>
                                    </div>
                                </StepperTrigger>
                            </StepperItem>
                        </StepperNav>

                        {/* Content Panels */}
                        <StepperPanel className="mt-8">
                            {/* Step 1: Account Info */}
                            <StepperContent value={1}>
                                <Motion
                                    animation={{
                                        from: {opacity: 0, y: 10},
                                        to: {opacity: 1, y: 0, duration: 0.2},
                                    }}
                                >
                                    <FieldGroup className="gap-4">
                                        <div
                                            className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                                            <User className="size-5 text-primary"/>
                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    Informations personnelles
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Veuillez entrer vos nom et prénom
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 w-full">
                                            <LegacyInput
                                                id="first_names"
                                                label="Prénom(s)"
                                                input={{
                                                    type: "text",
                                                    placeholder: "Ex: Jean",
                                                    required: true,
                                                    value: getter('first_names') || '',
                                                    onChange: e => setter('first_names', e.target.value)
                                                }}
                                                icon={<User className="size-4 text-muted-foreground/60"/>}
                                            />
                                            <LegacyInput
                                                id="last_name"
                                                label="Nom de famille"
                                                input={{
                                                    type: "text",
                                                    placeholder: "Ex: Dupont",
                                                    required: true,
                                                    value: getter('last_name') || '',
                                                    onChange: e => setter('last_name', e.target.value)
                                                }}
                                                icon={<User className="size-4 text-muted-foreground/60"/>}
                                            />
                                        </div>

                                        <LegacyInput
                                            id="organization"
                                            label="organization"
                                            input={{
                                                type: "text",
                                                placeholder: "Ex: Ma Société",
                                                required: true,
                                                value: getter('organization') || '',
                                                onChange: e => setter('organization', e.target.value)
                                            }}
                                            icon={<Building className="size-4 text-muted-foreground/60"/>}
                                        />

                                        <LegacyInput
                                            id="email"
                                            label="Email"
                                            input={{
                                                type: "email",
                                                placeholder: "email@example.com",
                                                required: true,
                                                value: getter('email') || '',
                                                onChange: e => setter('email', e.target.value)
                                            }}
                                            icon={<Mail className="size-4 text-muted-foreground/60"/>}
                                        />

                                        <LegacyInput
                                            id="username"
                                            label="Nom d'utilisateur (optionnel)"
                                            input={{
                                                type: "text",
                                                placeholder: "username",
                                                value: getter('username') || '',
                                                onChange: e => setter('username', e.target.value)
                                            }}
                                            icon={<User className="size-4 text-muted-foreground/60"/>}
                                        />
                                    </FieldGroup>
                                </Motion>
                            </StepperContent>

                            {/* Step 2: Password */}
                            <StepperContent value={2}>
                                <Motion
                                    animation={{
                                        from: {opacity: 0, y: 10},
                                        to: {opacity: 1, y: 0, duration: 0.2},
                                    }}
                                >
                                    <FieldGroup className="gap-4">
                                        <div
                                            className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                                            <Shield className="size-5 text-primary"/>
                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    Sécurisez votre compte
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Minimum 6 caractères
                                                </p>
                                            </div>
                                        </div>

                                        <LegacyInput
                                            id="password"
                                            label="Mot de passe"
                                            input={{
                                                type: showPassword ? "text" : "password",
                                                placeholder: "••••••••",
                                                required: true,
                                                value: getter('password') || '',
                                                onChange: e => setter('password', e.target.value),
                                            }}
                                            icon={
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="text-muted-foreground/60 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                                                >
                                                    {showPassword ? <EyeOff className="size-4"/> :
                                                        <Eye className="size-4"/>}
                                                </button>
                                            }
                                        />

                                        <LegacyInput
                                            id="password_confirmation"
                                            label="Confirmer le mot de passe"
                                            input={{
                                                type: showConfirmPassword ? "text" : "password",
                                                placeholder: "••••••••",
                                                required: true,
                                                value: getter('password_confirmation') || '',
                                                onChange: e => setter('password_confirmation', e.target.value)
                                            }}
                                            icon={
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="text-muted-foreground/60 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="size-4"/> :
                                                        <Eye className="size-4"/>}
                                                </button>
                                            }
                                        />
                                    </FieldGroup>
                                </Motion>
                            </StepperContent>

                            {/* Step 3: Contact Info */}
                            <StepperContent value={3}>
                                <Motion
                                    animation={{
                                        from: {opacity: 0, y: 10},
                                        to: {opacity: 1, y: 0, duration: 0.2},
                                    }}
                                >
                                    <FieldGroup className="gap-4">
                                        <div
                                            className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                                            <Phone className="size-5 text-primary"/>
                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    Informations de contact
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Nous utiliserons ceci pour la vérification
                                                </p>
                                            </div>
                                        </div>

                                        <LegacyPhoneInput
                                            id="phone"
                                            label="Numéro de téléphone"
                                            value={getter('phone') || ''}
                                            onChange={value => setter('phone', value)}
                                            input={{
                                                placeholder: "6 12 34 56 78",
                                                required: true,
                                            }}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <LegacyInput
                                                id="country"
                                                label="Pays (optionnel)"
                                                input={{
                                                    type: "text",
                                                    placeholder: "France",
                                                    value: getter('country') || '',
                                                    onChange: e => setter('country', e.target.value)
                                                }}
                                                icon={<MapPin className="size-4 text-muted-foreground/60"/>}
                                            />
                                            <LegacyInput
                                                id="city"
                                                label="Ville (optionnel)"
                                                input={{
                                                    type: "text",
                                                    placeholder: "Paris",
                                                    value: getter('city') || '',
                                                    onChange: e => setter('city', e.target.value)
                                                }}
                                                icon={<MapPin className="size-4 text-muted-foreground/60"/>}
                                            />
                                        </div>

                                        <LegacyInput
                                            id="address"
                                            label="Adresse (optionnel)"
                                            input={{
                                                type: "text",
                                                placeholder: "123 Rue de la Paix",
                                                value: getter('address') || '',
                                                onChange: e => setter('address', e.target.value)
                                            }}
                                            icon={<MapPin className="size-4 text-muted-foreground/60"/>}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <LegacyBirthDateInput
                                                id="birth_date"
                                                label="Date de naissance (optionnel)"
                                                input={{
                                                    value: getter('birth_date') || '',
                                                    onChange: e => setter('birth_date', e.target.value)
                                                }}
                                                icon={<Calendar className="size-4 text-muted-foreground/60"/>}
                                            />
                                            <LegacyInput
                                                id="gender"
                                                label="Genre (optionnel)"
                                                input={{
                                                    type: "text",
                                                    placeholder: "Homme / Femme / Autre",
                                                    value: getter('gender') || '',
                                                    onChange: e => setter('gender', e.target.value)
                                                }}
                                                icon={<User className="size-4 text-muted-foreground/60"/>}
                                            />
                                        </div>
                                    </FieldGroup>
                                </Motion>
                            </StepperContent>

                            {/* Step 4: OTP Verification */}
                            <StepperContent value={4}>
                                <Motion
                                    animation={{
                                        from: {opacity: 0, y: 10},
                                        to: {opacity: 1, y: 0, duration: 0.2},
                                    }}
                                >
                                    <FieldGroup className="gap-4">
                                        <div
                                            className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                                            <FileText className="size-5 text-primary"/>
                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    Vérification
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Générez et entrez le code OTP
                                                </p>
                                            </div>
                                        </div>

                                        {!otpGenerated ? (
                                            <Button
                                                type="button"
                                                onClick={handleGenerateOTP}
                                                disabled={otpLoading}
                                                className="w-full rounded-full font-semibold py-5 transition-all"
                                            >
                                                {otpLoading ? (
                                                    <>
                                                        <WaitingActivity size={16}/>
                                                        Génération...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Shield className="size-4 mr-2"/>
                                                        Générer un code OTP
                                                    </>
                                                )}
                                            </Button>
                                        ) : (
                                            <div
                                                className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                                                <CheckCircle2 className="size-5 text-green-500 flex-shrink-0"/>
                                                <p className="text-sm text-green-500">Code OTP généré avec succès</p>
                                            </div>
                                        )}

                                        <LegacyInput
                                            id="otp"
                                            label="Code OTP"
                                            input={{
                                                type: "text",
                                                placeholder: "000000",
                                                required: true,
                                                maxLength: 6,
                                                value: getter('otp') || '',
                                                onChange: e => setter('otp', e.target.value.replace(/\D/g, ''))
                                            }}
                                            icon={<FileText className="size-4 text-muted-foreground/60"/>}
                                        />
                                    </FieldGroup>
                                </Motion>
                            </StepperContent>

                            {/* Step 5: Completion */}
                            <StepperContent value={5}>
                                <Motion
                                    animation={{
                                        from: {opacity: 0, y: 10},
                                        to: {opacity: 1, y: 0, duration: 0.2},
                                    }}
                                    className="flex flex-col items-center justify-center gap-4 py-8"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"/>
                                        <CheckCircle2 className="size-16 text-green-500 relative"/>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white text-center">
                                        Compte créé avec succès !
                                    </h2>
                                    <p className="text-sm text-muted-foreground text-center max-w-sm">
                                        Votre compte a été créé et activé. Vous pouvez maintenant vous connecter.
                                    </p>
                                    <Button
                                        type="button"
                                        className="rounded-full font-semibold py-5 px-8 mt-4 transition-all"
                                        onClick={() => window.location.href = `${AuthConfig.routes.login}`}
                                    >
                                        Se connecter
                                    </Button>
                                </Motion>
                            </StepperContent>
                        </StepperPanel>
                    </Stepper>

                    {/* Navigation Buttons */}
                    {activeStep < 5 && (
                        <div className="flex items-center gap-3 mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={activeStep === 1 || loading}
                                onClick={handlePrevStep}
                                className="flex-1 rounded-full border-none text-muted-foreground hover:text-white transition-all py-5"
                            >
                                <ChevronLeft className="size-4 mr-2"/>
                                Précédent
                            </Button>

                            {activeStep === 4 ? (
                                <Button
                                    type="submit"
                                    disabled={!otpGenerated || loading}
                                    className="flex-1 rounded-full text-white font-bold border-none transition-all py-5 shadow-lg shadow-primary/20"
                                >
                                    {loading ? (
                                        <>
                                            <WaitingActivity size={16}/>
                                            Création...
                                        </>
                                    ) : (
                                        <>
                                            Créer le compte
                                            <CheckCircle2 className="size-4 ml-2"/>
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={handleNextStep}
                                    disabled={loading}
                                    className="flex-1 rounded-full text-white font-bold border-none transition-all py-5 shadow-lg shadow-primary/20"
                                >
                                    Suivant
                                    <ChevronRight className="size-4 ml-2"/>
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </form>

            {/* Terms */}
            <p className="px-2 text-left text-[11px] text-muted-foreground/50 leading-relaxed">
                En continuant la navigation, vous acceptez nos{" "}
                <Link href="#" className="underline hover:text-white">
                    Conditions Générales d'utilisation
                </Link>{" "}
                et notre{" "}
                <Link href="#" className="underline hover:text-white">
                    Politique de confidentialité
                </Link>
                .
            </p>
        </Motion>
    )
}
