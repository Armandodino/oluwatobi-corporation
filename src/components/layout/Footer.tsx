import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/logo.jpeg" 
                alt="OLUWATOBI CORPORATION" 
                className="h-14 w-14 rounded-lg object-cover"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white leading-tight">OLUWATOBI</span>
                <span className="text-sm font-semibold text-amber-500 leading-tight">CORPORATION</span>
              </div>
            </div>
            <p className="text-slate-400 mb-4">
              Votre partenaire de confiance pour tous vos travaux de bricolage et rénovation en Côte d&apos;Ivoire.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-amber-500 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-amber-500 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-amber-500 transition-colors">Accueil</Link>
              </li>
              <li>
                <Link href="/?category=all" className="hover:text-amber-500 transition-colors">Tous les produits</Link>
              </li>
              <li>
                <Link href="/?section=promotions" className="hover:text-amber-500 transition-colors">Promotions</Link>
              </li>
              <li>
                <Link href="/?section=nouveautes" className="hover:text-amber-500 transition-colors">Nouveautés</Link>
              </li>
              <li>
                <Link href="/?section=conseils" className="hover:text-amber-500 transition-colors">Conseils bricolage</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/?section=livraison" className="hover:text-amber-500 transition-colors">Livraison à Abidjan</Link>
              </li>
              <li>
                <Link href="/?section=retours" className="hover:text-amber-500 transition-colors">Retours & Remboursements</Link>
              </li>
              <li>
                <Link href="/?section=faq" className="hover:text-amber-500 transition-colors">FAQ</Link>
              </li>
              <li>
                <Link href="/?section=cgv" className="hover:text-amber-500 transition-colors">CGV</Link>
              </li>
              <li>
                <Link href="/?section=mentions" className="hover:text-amber-500 transition-colors">Mentions légales</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <span>Cocody, Rue des Jardins<br />Abidjan, Côte d&apos;Ivoire</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-amber-500 shrink-0" />
                <span>+225 07 15 54 14</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-amber-500 shrink-0" />
                <span>contact@oluwatobi-ci.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Ouvert 24h/24 - 7j/7</p>
                  <p className="text-slate-400">Service disponible à tout moment</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-slate-400">
              <span>© 2026 OLUWATOBI CORPORATION. Tous droits réservés.</span>
              <span className="hidden sm:inline text-slate-600">|</span>
              <span>Côte d&apos;Ivoire - Livraison à Abidjan et environs</span>
            </div>
            <p className="text-slate-500 text-xs mt-2">
              Développé par <span className="text-amber-500 font-semibold">AI&apos;vory</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
