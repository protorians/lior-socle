import {View} from "@sentients/sdk/presentation/themes/katon/view";
import {Header} from "@sentients/sdk/presentation/themes/katon/header";
import {Main} from "@sentients/sdk/presentation/themes/katon/main";


export default function Page() {

    return (
        <View>
            <Header/>
            <Main className="">
                main
            </Main>
            <footer>
                footer
            </footer>
        </View>
    )

}