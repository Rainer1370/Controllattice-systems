import type {Metadata} from "next";import "./globals.css";
export const metadata:Metadata={
  metadataBase:new URL("https://controllattice.com"),
  title:{default:"Control Lattice Systems | Controls, Observability & Digital Twins",template:"%s | Control Lattice Systems"},
  description:"Controls engineering, machine observability, SCADA and EPICS integration, diagnostics, digital twins, automation, and technical training for complex systems.",
  keywords:["controls engineering","machine observability","industrial automation","SCADA","EPICS","digital twins","machine diagnostics","predictive maintenance","control systems consulting"],
  alternates:{canonical:"/"},
  openGraph:{type:"website",url:"https://controllattice.com",siteName:"Control Lattice Systems",title:"Control Lattice Systems | Controls, Observability & Digital Twins",description:"Practical engineering for observable, diagnosable, reliable complex machines.",images:[{url:"/brand/scientific-facility-hero.jpg",width:1600,height:900,alt:"Scientific controls environment"}]},
  twitter:{card:"summary_large_image",title:"Control Lattice Systems",description:"Practical engineering for observable, diagnosable, reliable complex machines.",images:["/brand/scientific-facility-hero.jpg"]},
  robots:{index:true,follow:true},
  icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
