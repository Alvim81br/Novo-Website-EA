export interface Unit {
  id: string;
  city: string;
  name: string;
  state: string;
  address: string;
  whatsapp: string[];
  whatsappLink: string;
  instagram: string;
  online?: boolean;
}

const waMessage = encodeURIComponent(
  'Olá! Vim pelo site da English Academy e quero agendar uma aula experimental gratuita. 😊'
);

function wa(number: string): string {
  return `https://wa.me/55${number.replace(/\D/g, '')}?text=${waMessage}`;
}

export const units: Unit[] = [
  {
    id: 'parauapebas-cidade-nova',
    city: 'Parauapebas',
    name: 'Parauapebas — Cidade Nova',
    state: 'PA',
    address: 'Rua F, 334, Bairro União',
    whatsapp: ['(94) 98132-9429', '(94) 98100-2225'],
    whatsappLink: wa('94981329429'),
    instagram: 'english_academy_br',
  },
  {
    id: 'parauapebas-cidade-jardim',
    city: 'Parauapebas',
    name: 'Parauapebas — Cidade Jardim',
    state: 'PA',
    address: 'Av. dos Ipês, Qd 45, LT 07',
    whatsapp: ['(94) 99285-9134'],
    whatsappLink: wa('94992859134'),
    instagram: 'english_academy_br',
  },
  {
    id: 'belem-nazare',
    city: 'Belém',
    name: 'Belém — Nazaré',
    state: 'PA',
    address: 'Av. Generalíssimo Deodoro, nº 1485',
    whatsapp: ['(91) 98412-0322', '(91) 99223-8802'],
    whatsappLink: wa('91984120322'),
    instagram: 'english_academy_bel',
  },
  {
    id: 'maraba-cidade-nova',
    city: 'Marabá',
    name: 'Marabá — Cidade Nova',
    state: 'PA',
    address: 'Av. Tocantins, 457C, Novo Horizonte',
    whatsapp: ['(94) 99176-4708', '(94) 98179-7287'],
    whatsappLink: wa('94991764708'),
    instagram: 'english_academy_mba',
  },
  {
    id: 'maraba-nova-maraba',
    city: 'Marabá',
    name: 'Marabá — Nova Marabá',
    state: 'PA',
    address: 'Folha 28, Qd. 00, Lt. 04-A, VP-8',
    whatsapp: ['(94) 98182-4718'],
    whatsappLink: wa('94981824718'),
    instagram: 'english_academy_mba',
  },
  {
    id: 'canaa-dos-carajas',
    city: 'Canaã dos Carajás',
    name: 'Canaã dos Carajás — Centro',
    state: 'PA',
    address: 'Av. Weyne Cavalcante, nº 721',
    whatsapp: ['(94) 99103-1001', '(94) 98147-5142'],
    whatsappLink: wa('94991031001'),
    instagram: 'english_academy_can',
  },
  {
    id: 'imperatriz',
    city: 'Imperatriz',
    name: 'Imperatriz — Centro',
    state: 'MA',
    address: 'Av. Dorgival Pinheiro de Sousa, nº 917',
    whatsapp: ['(99) 98244-4646'],
    whatsappLink: wa('99982444646'),
    instagram: 'english_academy_itz',
  },
  {
    id: 'live',
    city: 'Online',
    name: 'English Academy Live',
    state: 'Online',
    address: 'www.englishacademy.live — estude de qualquer lugar!',
    whatsapp: ['(11) 91310-2263'],
    whatsappLink: wa('11913102263'),
    instagram: 'english_academy_live',
    online: true,
  },
];

/** WhatsApp padrão usado nos CTAs globais (unidade matriz — Parauapebas Cidade Nova). */
export const defaultWhatsappLink = units[0]!.whatsappLink;
