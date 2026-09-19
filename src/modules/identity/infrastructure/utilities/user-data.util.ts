import {UserInterface} from "@liorian/sdk/domain/entities/user.interface";
import {UserGenderEnum} from "@/modules/identity/domain/enums/user-gender.enum";
import {CreateUserInterface} from "@/modules/identity/domain/users.interface";



export function toInitialCreateUserData(user: UserInterface): Partial<CreateUserInterface> {
    return {
        email: user.email || '',
        phone: user.userPhones?.[0]?.phone || '',
        username: user.username || '',
        first_names: user.userData?.firstname || '',
        last_name: user.userData?.lastname || '',
        gender: user.userData?.gender as UserGenderEnum || undefined,
        birthDate: user.userData?.birthDate
            ? new Date(user.userData.birthDate).toISOString().split('T')[0]
            : '',
        country: user.userData?.country || '',
        city: user.userData?.city || '',
        address: user.userData?.address || '',
    }
};
