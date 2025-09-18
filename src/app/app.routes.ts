import { Routes } from '@angular/router';
import { DashboardListComponent } from './feature/dashboard/dashboard-list/dashboard-list.component';
import { KitchenListComponent } from './feature/kitchen/kitchen-list/kitchen-list.component';
import { ProductsListComponent } from './feature/products/products-list/products-list.component';
import { BoxListComponent } from './feature/box/box-list/box-list.component';
import { UsersListComponent } from './feature/users/users-list/users-list.component';
import { ReportsListComponent } from './feature/reports/reports-list/reports-list.component';
import { OrdersDetailListComponent } from './feature/orders/orders-detail-list/orders-detail-list.component';


export const routes: Routes = [

     {
        path: "dashboard",
        component: DashboardListComponent
    },

    {
        path: "kitchen",
        component: KitchenListComponent
    },

    {
        path: "products",
        component: ProductsListComponent
    },

    {
        path: "orders",
        component: OrdersDetailListComponent
    },


    {
        path: "box",
        component: BoxListComponent
    },

    {
        path: "users",
        component: UsersListComponent
    },

    {
        path: "reports",
        component: ReportsListComponent
    },

    {
        path: "",

        pathMatch: "full",

        redirectTo: "dashboard",
    }


];
