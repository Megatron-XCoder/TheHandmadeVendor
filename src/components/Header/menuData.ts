import { Menu } from "@/types/Menu";

export const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    newTab: false,
    path: "/",
  },
  {
    id: 2,
    title: "Shop",
    newTab: false,
    path: "/shop",
  },
  {
    id: 3,
    title: "Contact",
    newTab: false,
    path: "/contact",
  },
  {
    id: 6,
    title: "pages",
    newTab: false,
    path: "/",
    submenu: [
      {
        id: 61,
        title: "Artisanal Collection",
        newTab: false,
        path: "/shop",
      },
      {
        id: 64,
        title: "Checkout",
        newTab: false,
        path: "/checkout",
      },
      {
        id: 67,
        title: "Sign in",
        newTab: false,
        path: "/signin",
      },
      {
        id: 68,
        title: "Sign up",
        newTab: false,
        path: "/signup",
      },
      {
        id: 69,
        title: "My Account",
        newTab: false,
        path: "/my-account",
      },
      {
        id: 70,
        title: "Contact",
        newTab: false,
        path: "/contact",
      },
      {
        id: 62,
        title: "Error",
        newTab: false,
        path: "/error",
      },
      {
        id: 63,
        title: "Mail Success",
        newTab: false,
        path: "/mail-success",
      },
    ],
  },
];
