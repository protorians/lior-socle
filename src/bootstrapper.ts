import {PublicRouteAccess} from "@sentients/sdk/infrastructure/utilities/route-access";

export default function bootstrapper() {
    PublicRouteAccess.add('/intl')
    PublicRouteAccess.add('/intl/drive')
}
