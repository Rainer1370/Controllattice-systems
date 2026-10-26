import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '../site-chrome';
import StationGame from './station-game';
export const metadata: Metadata = { title: 'Lattice Lab — Station Rescue', description: 'A free science and math repair adventure. Investigate evidence, diagnose faults, and bring an orbital station back online.', alternates: { canonical: '/learn' }, openGraph: { title: 'Lattice Lab — Station Rescue', description: 'Think like a scientist. Fix like an engineer. A free learning adventure from Control Lattice.', url: 'https://controllattice.com/learn' } };
export default function LearnPage(){return <><SiteHeader active="learn"/><StationGame/><SiteFooter/></>}
