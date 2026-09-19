"use client"

import {cn} from "@liorian/sdk/infrastructure/utilities/utils"
import {Button} from "@liorian/sdk/presentation/ui/button"
import {FieldGroup} from "@liorian/sdk/presentation/ui/field"
import {LegacyInput} from "@liorian/sdk/presentation/ui/legacy-input"
import {LegacyPhoneInput} from "@liorian/sdk/presentation/ui/legacy-phone-input"
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@liorian/sdk/presentation/ui/tabs"
import {User, Mail, Phone, Eye, EyeOff} from "lucide-react"
import Link from "next/link"
import {useRouter} from "next/navigation"
import {useState} from "react"
import {SignInDataset} from "@liorian/sdk/infrastructure/dataset/sign-in.dataset"
import {Motion} from "@liorian/sdk/infrastructure/library/motion"
import {elasticEnter} from "@liorian/sdk/infrastructure/library/motion-utils"
import {AuthApiService} from "@liorian/sdk/application/service/auth-api-service";
import {AuthUserService} from "@liorian/sdk/application/service/auth-user.service";
import {authUserConnectedStore} from "@liorian/sdk/infrastructure/stores/auth-user-connected.store";
import {toast} from "sonner";
import {Activity} from "@liorian/sdk/presentation/components/activity";

export function LoginForm({className, ...props}: React.ComponentProps<"form">) {
    const {setter, getter, dataset, consolidate} = SignInDataset()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [identifierType, setIdentifierType] = useState("email")
    const [phonePrefix, setPhonePrefix] = useState("")
    const router = useRouter()
    const {setCurrentUser, setOrganizations} = authUserConnectedStore()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // consolidate() validates and will toast + throw if invalid
            const data = consolidate();
            const response = await AuthApiService.signIn({
                username: data.identifier!,
                password: data.password!,
                prefix: phonePrefix,
                identifierType: identifierType as 'email' | 'phone' | 'username',
            })
            const authData = response.data.data || undefined;

            if (!authData) {
                toast.error("Réponse invalide du serveur");
                return;
            }

            if (authData.token && authData.user) {
                await AuthUserService.setSession(authData);
                setCurrentUser(authData.user);
                setOrganizations(authData.organizations || []);
                toast.success("Connexion réussie");

                const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl") || "/dashboard";
                router.push(`/auth/select-organization?callbackUrl=${encodeURIComponent(callbackUrl)}`);
            } else {
                toast.error("Réponse invalide du serveur");
            }
        } catch (error: any) {
            console.error('Login Error', error)
            toast.error(error?.response?.response?.message || "Erreur de connexion");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Motion
            animation={elasticEnter()}
            className={cn("flex flex-col gap-6 w-full", className)}>
            <form onSubmit={handleSubmit} {...props}>
                <FieldGroup className="gap-4">
                    <div className="flex flex-col gap-1 text-left w-full mb-4">
                        <span className="text-[10px] font-bold tracking-wider text-primary uppercase">Bon retour</span>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">
                            Se connecter<span className="text-primary">.</span>
                        </h1>
                        <p className="text-xs text-muted-foreground mt-1">
                            Vous n'avez pas de compte?{" "}
                            <Link href="/auth/sign-up" className="text-primary hover:underline font-semibold">
                                S'inscrire
                            </Link>
                        </p>
                    </div>

                    <Tabs value={identifierType} onValueChange={setIdentifierType} className="w-full">
                        <TabsList className="w-full">
                            <TabsTrigger value="email" className="flex-1 gap-1.5">
                                <Mail className="size-3.5"/>
                                Email
                            </TabsTrigger>
                            <TabsTrigger value="phone" className="flex-1 gap-1.5">
                                <Phone className="size-3.5"/>
                                Téléphone
                            </TabsTrigger>
                            <TabsTrigger value="username" className="flex-1 gap-1.5">
                                <User className="size-3.5"/>
                                Nom d'utilisateur
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="email">
                            <LegacyInput
                                id="identifier"
                                label="Email"
                                input={{
                                    type: "text",
                                    placeholder: "exemple@email.com",
                                    required: true,
                                    value: getter('identifier') || '',
                                    onChange: e => setter('identifier', e.target.value),
                                }}
                                icon={<Mail className="size-4 text-muted-foreground/60"/>}
                            />
                        </TabsContent>

                        <TabsContent value="phone">
                            <LegacyPhoneInput
                                label="Téléphone"
                                onChange={(_, prefix, value) => {
                                    setter('identifier', value);
                                    setPhonePrefix(prefix);
                                }}
                                input={{
                                    placeholder: "XX XX XX XX",
                                    required: true,
                                }}
                            />
                        </TabsContent>

                        <TabsContent value="username">
                            <LegacyInput
                                id="identifier"
                                label="Nom d'utilisateur"
                                input={{
                                    type: "text",
                                    placeholder: "votre nom d'utilisateur",
                                    required: true,
                                    value: getter('identifier') || '',
                                    onChange: e => setter('identifier', e.target.value),
                                }}
                                icon={<User className="size-4 text-muted-foreground/60"/>}
                            />
                        </TabsContent>
                    </Tabs>

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
                                {showPassword ? <EyeOff className="size-4"/> : <Eye className="size-4"/>}
                            </button>
                        }
                    />

                    <div className="flex items-center gap-4 w-full mt-4">
                        {/*<Button*/}
                        {/*    type="button"*/}
                        {/*    variant="outline"*/}
                        {/*    className="flex-1 rounded-full border-none text-muted-foreground hover:text-white transition-all py-5 cursor-pointer"*/}
                        {/*    onClick={() => window.location.href = "/auth/sign-up"}*/}
                        {/*>*/}
                        {/*    S'inscrire*/}
                        {/*</Button>*/}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 rounded-full text-white font-bold border-none transition-all py-5 shadow-lg shadow-primary/20 cursor-pointer"
                        >
                            {isLoading ? <Activity.Loader size={16}/> : "Se connecter"}
                        </Button>
                    </div>
                </FieldGroup>
            </form>
            <p className="px-2 text-left text-[11px] text-muted-foreground/50 leading-relaxed">
                En continuant la navigation, vous acceptez nos <Link href="#" className="underline hover:text-white">Conditions
                Générales d'utilisation</Link> et notre <Link href="#" className="underline hover:text-white">Politique
                de confidentialité</Link>.
            </p>
        </Motion>
    )
}
