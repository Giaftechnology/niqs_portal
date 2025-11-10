export type Country = { name: string; states?: { name: string; lgas?: string[] }[] };

// Embedded Nigeria States and LGAs dataset (as provided)
const NIGERIA_STATES_LGAS: { name: string; lgas: string[] }[] = [
  { name: 'Adamawa', lgas: [
    'Demsa','Fufure','Ganye','Gayuk','Gombi','Grie','Hong','Jada','Larmurde','Madagali','Maiha','Mayo Belwa','Michika','Mubi North','Mubi South','Numan','Shelleng','Song','Toungo','Yola North','Yola South'
  ]},
  { name: 'Akwa Ibom', lgas: [
    'Abak','Eastern Obolo','Eket','Esit Eket','Essien Udim','Etim Ekpo','Etinan','Ibeno','Ibesikpo Asutan','Ibiono-Ibom','Ikot Abasi','Ika','Ikono','Ikot Ekpene','Ini','Mkpat-Enin','Itu','Mbo','Nsit-Atai','Nsit-Ibom','Nsit-Ubium','Obot Akara','Okobo','Onna','Oron','Udung-Uko','Ukanafun','Oruk Anam','Uruan','Urue-Offong/Oruko','Uyo'
  ]},
  { name: 'Anambra', lgas: [
    'Aguata','Anambra East','Anaocha','Awka North','Anambra West','Awka South','Ayamelum','Dunukofia','Ekwusigo','Idemili North','Idemili South','Ihiala','Njikoka','Nnewi North','Nnewi South','Ogbaru','Onitsha North','Onitsha South','Orumba North','Orumba South','Oyi'
  ]},
  { name: 'Ogun', lgas: [
    'Abeokuta North','Abeokuta South','Ado-Odo/Ota','Egbado North','Ewekoro','Egbado South','Ijebu North','Ijebu East','Ifo','Ijebu Ode','Ijebu North East','Imeko Afon','Ikenne','Ipokia','Odeda','Obafemi Owode','Odogbolu','Remo North','Ogun Waterside','Shagamu'
  ]},
  { name: 'Ondo', lgas: [
    'Akoko North-East','Akoko North-West','Akoko South-West','Akoko South-East','Akure North','Akure South','Ese Odo','Idanre','Ifedore','Ilaje','Irele','Ile Oluji/Okeigbo','Odigbo','Okitipupa','Ondo West','Ose','Ondo East','Owo'
  ]},
  { name: 'Rivers', lgas: [
    'Abua/Odual','Ahoada East','Ahoada West','Andoni','Akuku-Toru','Asari-Toru','Bonny','Degema','Emuoha','Eleme','Ikwerre','Etche','Gokana','Khana','Obio/Akpor','Ogba/Egbema/Ndoni','Ogu/Bolo','Okrika','Omuma','Opobo/Nkoro','Oyigbo','Port Harcourt','Tai'
  ]},
  { name: 'Bauchi', lgas: [
    'Alkaleri','Bauchi','Bogoro','Damban','Darazo','Dass','Gamawa','Ganjuwa','Giade','Itas/Gadau','Jama\'are','Katagum','Kirfi','Misau','Ningi','Shira','Tafawa Balewa','Toro','Warji','Zaki'
  ]},
  { name: 'Benue', lgas: [
    'Agatu','Apa','Ado','Buruku','Gboko','Guma','Gwer East','Gwer West','Katsina-Ala','Konshisha','Kwande','Logo','Makurdi','Obi','Ogbadibo','Ohimini','Oju','Okpokwu','Oturkpo','Tarka','Ukum','Ushongo','Vandeikya'
  ]},
  { name: 'Borno', lgas: [
    'Abadam','Askira/Uba','Bama','Bayo','Biu','Chibok','Damboa','Dikwa','Guzamala','Gubio','Hawul','Gwoza','Jere','Kaga','Kala/Balge','Konduga','Kukawa','Kwaya Kusar','Mafa','Magumeri','Maiduguri','Mobbar','Marte','Monguno','Ngala','Nganzai','Shani'
  ]},
  { name: 'Bayelsa', lgas: [
    'Brass','Ekeremor','Kolokuma/Opokuma','Nembe','Ogbia','Sagbama','Southern Ijaw','Yenagoa'
  ]},
  { name: 'Cross River', lgas: [
    'Abi','Akamkpa','Akpabuyo','Bakassi','Bekwarra','Biase','Boki','Calabar Municipal','Calabar South','Etung','Ikom','Obanliku','Obubra','Obudu','Odukpani','Ogoja','Yakuur','Yala'
  ]},
  { name: 'Delta', lgas: [
    'Aniocha North','Aniocha South','Bomadi','Burutu','Ethiope West','Ethiope East','Ika North East','Ika South','Isoko North','Isoko South','Ndokwa East','Ndokwa West','Okpe','Oshimili North','Oshimili South','Patani','Sapele','Udu','Ughelli North','Ukwuani','Ughelli South','Uvwie','Warri North','Warri South','Warri South West'
  ]},
  { name: 'Ebonyi', lgas: [
    'Abakaliki','Afikpo North','Ebonyi','Afikpo South','Ezza North','Ikwo','Ezza South','Ivo','Ishielu','Izzi','Ohaozara','Ohaukwu','Onicha'
  ]},
  { name: 'Edo', lgas: [
    'Akoko-Edo','Egor','Esan Central','Esan North-East','Esan South-East','Esan West','Etsako Central','Etsako East','Etsako West','Igueben','Ikpoba Okha','Orhionmwon','Oredo','Ovia North-East','Ovia South-West','Owan East','Owan West','Uhunmwonde'
  ]},
  { name: 'Ekiti', lgas: [
    'Ado Ekiti','Efon','Ekiti East','Ekiti South-West','Ekiti West','Emure','Gbonyin','Ido Osi','Ijero','Ikere','Ilejemeje','Irepodun/Ifelodun','Ikole','Ise/Orun','Moba','Oye'
  ]},
  { name: 'Enugu', lgas: [
    'Awgu','Aninri','Enugu East','Enugu North','Ezeagu','Enugu South','Igbo Etiti','Igbo Eze North','Igbo Eze South','Isi Uzo','Nkanu East','Nkanu West','Nsukka','Udenu','Oji River','Uzo Uwani','Udi'
  ]},
  { name: 'Abuja (FCT)', lgas: [
    'Abaji','Bwari','Gwagwalada','Kuje','Kwali','Municipal Area Council'
  ]},
  { name: 'Gombe', lgas: [
    'Akko','Balanga','Billiri','Dukku','Funakaye','Gombe','Kaltungo','Kwami','Nafada','Shongom','Yamaltu/Deba'
  ]},
  { name: 'Jigawa', lgas: [
    'Auyo','Babura','Buji','Biriniwa','Birnin Kudu','Dutse','Gagarawa','Garki','Gumel','Guri','Gwaram','Gwiwa','Hadejia','Jahun','Kafin Hausa','Kazaure','Kiri Kasama','Kiyawa','Kaugama','Maigatari','Malam Madori','Miga','Sule Tankarkar','Roni','Ringim','Yankwashi','Taura'
  ]},
  { name: 'Oyo', lgas: [
    'Afijio','Akinyele','Atiba','Atisbo','Egbeda','Ibadan North','Ibadan North-East','Ibadan North-West','Ibadan South-East','Ibarapa Central','Ibadan South-West','Ibarapa East','Ido','Ibarapa North','Irepo','Iseyin','Itesiwaju','Iwajowa','Kajola','Lagelu','Ogbomosho North','Ogbomosho South','Ogo Oluwa','Olorunsogo','Oluyole','Ona Ara','Orelope','Ori Ire','Oyo','Oyo East','Saki East','Saki West','Surulere Oyo State'
  ]},
  { name: 'Imo', lgas: [
    'Aboh Mbaise','Ahiazu Mbaise','Ehime Mbano','Ezinihitte','Ideato North','Ideato South','Ihitte/Uboma','Ikeduru','Isiala Mbano','Mbaitoli','Isu','Ngor Okpala','Njaba','Nkwerre','Nwangele','Obowo','Oguta','Ohaji/Egbema','Okigwe','Orlu','Orsu','Oru East','Oru West','Owerri Municipal','Owerri North','Unuimo','Owerri West'
  ]},
  { name: 'Kaduna', lgas: [
    'Birnin Gwari','Chikun','Giwa','Ikara','Igabi','Jaba','Jema\'a','Kachia','Kaduna North','Kaduna South','Kagarko','Kajuru','Kaura','Kauru','Kubau','Kudan','Lere','Makarfi','Sabon Gari','Sanga','Soba','Zangon Kataf','Zaria'
  ]},
  { name: 'Kebbi', lgas: [
    'Aleiro','Argungu','Arewa Dandi','Augie','Bagudo','Birnin Kebbi','Bunza','Dandi','Fakai','Gwandu','Jega','Kalgo','Koko/Besse','Maiyama','Ngaski','Shanga','Suru','Sakaba','Wasagu/Danko','Yauri','Zuru'
  ]},
  { name: 'Kano', lgas: [
    'Ajingi','Albasu','Bagwai','Bebeji','Bichi','Bunkure','Dala','Dambatta','Dawakin Kudu','Dawakin Tofa','Doguwa','Fagge','Gabasawa','Garko','Garun Mallam','Gezawa','Gaya','Gwale','Gwarzo','Kabo','Kano Municipal','Karaye','Kibiya','Kiru','Kumbotso','Kunchi','Kura','Madobi','Makoda','Minjibir','Nasarawa','Rano','Rimin Gado','Rogo','Shanono','Takai','Sumaila','Tarauni','Tofa','Tsanyawa','Tudun Wada','Ungogo','Warawa','Wudil'
  ]},
  { name: 'Kogi', lgas: [
    'Ajaokuta','Adavi','Ankpa','Bassa','Dekina','Ibaji','Idah','Igalamela Odolu','Ijumu','Kogi','Kabba/Bunu','Lokoja','Ofu','Mopa Muro','Ogori/Magongo','Okehi','Okene','Olamaboro','Omala','Yagba East','Yagba West'
  ]},
  { name: 'Osun', lgas: [
    'Aiyedire','Atakunmosa West','Atakunmosa East','Aiyedaade','Boluwaduro','Boripe','Ife East','Ede South','Ife North','Ede North','Ife South','Ejigbo','Ife Central','Ifedayo','Egbedore','Ila','Ifelodun','Ilesa East','Ilesa West','Irepodun','Irewole','Isokan','Iwo','Obokun','Odo Otin','Ola Oluwa','Olorunda','Oriade','Orolu','Osogbo'
  ]},
  { name: 'Sokoto', lgas: [
    'Gudu','Gwadabawa','Illela','Isa','Kebbe','Kware','Rabah','Sabon Birni','Shagari','Silame','Sokoto North','Sokoto South','Tambuwal','Tangaza','Tureta','Wamako','Wurno','Yabo','Binji','Bodinga','Dange Shuni','Goronyo','Gada'
  ]},
  { name: 'Plateau', lgas: [
    'Bokkos','Barkin Ladi','Bassa','Jos East','Jos North','Jos South','Kanam','Kanke','Langtang South','Langtang North','Mangu','Mikang','Pankshin','Qua\'an Pan','Riyom','Shendam','Wase'
  ]},
  { name: 'Taraba', lgas: [
    'Ardo Kola','Bali','Donga','Gashaka','Gassol','Ibi','Jalingo','Karim Lamido','Kumi','Lau','Sardauna','Takum','Ussa','Wukari','Yorro','Zing'
  ]},
  { name: 'Yobe', lgas: [
    'Bade','Bursari','Damaturu','Fika','Fune','Geidam','Gujba','Gulani','Jakusko','Karasuwa','Machina','Nangere','Nguru','Potiskum','Tarmuwa','Yunusari','Yusufari'
  ]},
  { name: 'Zamfara', lgas: [
    'Anka','Birnin Magaji/Kiyaw','Bakura','Bukkuyum','Bungudu','Gummi','Gusau','Kaura Namoda','Maradun','Shinkafi','Maru','Talata Mafara','Tsafe','Zurmi'
  ]},
  { name: 'Lagos', lgas: [
    'Agege','Ajeromi-Ifelodun','Alimosho','Amuwo-Odofin','Badagry','Apapa','Epe','Eti Osa','Ibeju-Lekki','Ifako-Ijaiye','Ikeja','Ikorodu','Kosofe','Lagos Island','Mushin','Lagos Mainland','Ojo','Oshodi-Isolo','Shomolu','Surulere Lagos State'
  ]},
  { name: 'Katsina', lgas: [
    'Bakori','Batagarawa','Batsari','Baure','Bindawa','Charanchi','Danja','Dandume','Dan Musa','Daura','Dutsi','Dutsin Ma','Faskari','Funtua','Ingawa','Jibia','Kafur','Kaita','Kankara','Kankia','Katsina','Kurfi','Kusada','Mai\'Adua','Malumfashi','Mani','Mashi','Matazu','Musawa','Rimi','Sabuwa','Safana','Sandamu','Zango'
  ]},
  { name: 'Kwara', lgas: [
    'Asa','Baruten','Edu','Ilorin East','Ifelodun','Ilorin South','Ekiti Kwara State','Ilorin West','Irepodun','Isin','Kaiama','Moro','Offa','Oke Ero','Oyun','Pategi'
  ]},
  { name: 'Nasarawa', lgas: [
    'Akwanga','Awe','Doma','Karu','Keana','Keffi','Lafia','Kokona','Nasarawa Egon','Nasarawa','Obi','Toto','Wamba'
  ]},
  { name: 'Niger', lgas: [
    'Agaie','Agwara','Bida','Borgu','Bosso','Chanchaga','Edati','Gbako','Gurara','Katcha','Kontagora','Lapai','Lavun','Mariga','Magama','Mokwa','Mashegu','Moya','Paikoro','Rafi','Rijau','Shiroro','Suleja','Tafa','Wushishi'
  ]},
  { name: 'Abia', lgas: [
    'Aba North','Arochukwu','Aba South','Bende','Isiala Ngwa North','Ikwuano','Isiala Ngwa South','Isuikwuato','Obi Ngwa','Ohafia','Osisioma','Ugwunagbo','Ukwa East','Ukwa West','Umuahia North','Umuahia South','Umu Nneochi'
  ]},
];

// Minimal seed. Extend as needed. You can inject a full dataset via localStorage 'countries_dataset' or window.COUNTRIES_EXT
const BASE_COUNTRIES: Country[] = [
  {
    name: 'Nigeria',
    states: NIGERIA_STATES_LGAS,
  },
  { name: 'Ghana' },
  { name: 'United Kingdom' },
  { name: 'United States' },
  { name: 'Canada' },
];

export const getCountries = (): Country[] => {
  let extra: Country[] = [];
  try {
    const raw = localStorage.getItem('countries_dataset');
    if (raw) extra = JSON.parse(raw);
  } catch {}
  try {
    const w: any = window as any;
    if (w && Array.isArray(w.COUNTRIES_EXT)) {
      extra = [...extra, ...w.COUNTRIES_EXT];
    }
  } catch {}
  // Optionally accept a Nigeria-specific LGA dataset and override Nigeria states
  let nigeriaOverride: Country | undefined;
  try {
    const nraw = localStorage.getItem('nigeria_lgas');
    if (nraw) {
      const arr = JSON.parse(nraw);
      if (Array.isArray(arr)) {
        nigeriaOverride = {
          name: 'Nigeria',
          states: arr.map((s: any) => ({ name: s.state || s.name, lgas: Array.isArray(s.lgas) ? s.lgas : [] })),
        };
      }
    }
  } catch {}
  try {
    const w: any = window as any;
    const arr = w && Array.isArray(w.NIGERIA_LGAS) ? w.NIGERIA_LGAS : undefined;
    if (!nigeriaOverride && arr) {
      nigeriaOverride = {
        name: 'Nigeria',
        states: arr.map((s: any) => ({ name: s.state || s.name, lgas: Array.isArray(s.lgas) ? s.lgas : [] })),
      };
    }
  } catch {}

  // Merge by country name
  const map = new Map<string, Country>();
  [...BASE_COUNTRIES, ...extra].forEach((c) => map.set(c.name, c));
  if (nigeriaOverride) {
    map.set('Nigeria', nigeriaOverride);
  }
  return Array.from(map.values());
};
