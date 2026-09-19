import {PublicRouteAccess} from "@liorian/sdk/infrastructure/utilities/route-access";

export default function bootstrapper() {
    PublicRouteAccess.add('/intl')
    PublicRouteAccess.add('/intl/drive')
}
