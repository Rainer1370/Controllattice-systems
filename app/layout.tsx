import type {Metadata} from "next";import "./globals.css";
export const metadata:Metadata={title:"Control Lattice Systems | Advanced Controls & Scientific Systems",description:"Control Lattice Systems engineers controls, diagnostics, digital twins, AI-assisted workflows, and infrastructure for advanced scientific facilities and complex technical operations.",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
