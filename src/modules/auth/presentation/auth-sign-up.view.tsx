import { RegisterFormStepper } from "@/modules/auth/presentation/components/register-form-stepper";
import {FormScreen} from "@liorian/sdk/presentation/form-screen";

export function AuthSignUpView() {
    return (
        <FormScreen hideSideImage>
            <RegisterFormStepper />
        </FormScreen>
    )
}