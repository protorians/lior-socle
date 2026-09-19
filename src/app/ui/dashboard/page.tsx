import {View} from "@liorian/sdk/presentation/themes/katon/view";


export default function Page() {

    return (
        <View>
            <View.Helmet/>
            <View.Frame className="">
                main
            </View.Frame>
            <footer>
                footer
            </footer>
        </View>
    )

}