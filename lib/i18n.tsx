'use client';

import React, {createContext, useContext, useEffect, useState, useCallback} from 'react';
import {Globe, Check} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type Locale = 'fr' | 'en' | 'ar' | 'tn';

export interface LanguageOption {
  code: Locale;
  label: string;
  shortLabel: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: LanguageOption[] = [
  {code: 'fr', label: 'Français', shortLabel: 'FR', flag: '🇫🇷', dir: 'ltr'},
  {code: 'en', label: 'English', shortLabel: 'EN', flag: '🇬🇧', dir: 'ltr'},
  {code: 'ar', label: 'العربية', shortLabel: 'AR', flag: '🇹🇳', dir: 'rtl'},
  {code: 'tn', label: 'Derja (تونسي)', shortLabel: 'TN', flag: '🇹🇳', dir: 'ltr'},
];

const STORAGE_KEY = '9arrini_lang_v1';

/**
 * Dictionary keyed by standard French strings -> { en, ar, tn }
 * Since French is the standard language across the whole website,
 * French renders natively with zero overhead and translates cleanly to EN, AR, and TN (Derja).
 */
export const PHRASE_TRANSLATIONS: Record<
  string,
  {en: string; ar: string; tn: string}
> = {
  // Navbar & Navigation
  'Explorer les Profs': {
    en: 'Explore Tutors',
    ar: 'استكشف الأساتذة',
    tn: 'Lawwej 3la Prof',
  },
  Messagerie: {
    en: 'Messages',
    ar: 'الرسائل',
    tn: 'Messaget',
  },
  'Mes Cours': {
    en: 'My Lessons',
    ar: 'دروسي',
    tn: 'Drousi',
  },
  'Mes Cours Réservés': {
    en: 'My Booked Lessons',
    ar: 'دروسي المحجوزة',
    tn: 'Drous elli 7ajzthom',
  },
  'Tableau de bord': {
    en: 'Dashboard',
    ar: 'لوحة التحكم',
    tn: 'Tableau de bord',
  },
  'Mon Profil': {
    en: 'My Profile',
    ar: 'ملفي الشخصي',
    tn: 'Profili',
  },
  Profil: {
    en: 'Profile',
    ar: 'الملف الشخصي',
    tn: 'Profil',
  },
  Déconnexion: {
    en: 'Sign out',
    ar: 'تسجيل الخروج',
    tn: 'Okhroj',
  },
  'Devenir Prof (Candidature) 👨‍🏫': {
    en: 'Become a Tutor (Apply) 👨‍🏫',
    ar: 'كن أستاذاً (تقديم طلب) 👨‍🏫',
    tn: 'Walli Prof m3ana 👨‍🏫',
  },
  'Espace Élève / Connexion 🎓': {
    en: 'Student Area / Sign In 🎓',
    ar: 'فضاء التلميذ / دخول 🎓',
    tn: 'Espace Élève /odkhol 🎓',
  },
  'Connexion Élève': {
    en: 'Student Sign In',
    ar: 'دخول التلميذ',
    tn: 'Odkhol (Élève)',
  },
  'Inscription Élève': {
    en: 'Student Sign Up',
    ar: 'تسجيل تلميذ جديد',
    tn: 'Sajjel compte Élève',
  },
  'Candidature Professeur 👨‍🏫': {
    en: 'Tutor Application 👨‍🏫',
    ar: 'ترشح كأستاذ 👨‍🏫',
    tn: 'Candidature Prof 👨‍🏫',
  },
  'Notifications & Rappels de cours': {
    en: 'Notifications & Lesson Reminders',
    ar: 'الإشعارات وتذكيرات الدروس',
    tn: 'Notifications w Rappels',
  },
  'Tout voir': {
    en: 'View all',
    ar: 'عرض الكل',
    tn: 'Chouf el kol',
  },
  'Voir tout': {
    en: 'See all',
    ar: 'عرض الكل',
    tn: 'Chouf el kol',
  },
  'Aucune nouvelle notification': {
    en: 'No new notifications',
    ar: 'لا توجد إشعارات جديدة',
    tn: 'Mafamma 7atta notification jdida',
  },
  'Voir mes séances réservées →': {
    en: 'View my booked lessons →',
    ar: 'عرض حصصي المحجوزة ←',
    tn: 'Chouf drousi elli 7ajzthom →',
  },

  // Hero & Home Page
  'Trouvez facilement le professeur idéal pour réussir !': {
    en: 'Easily find the right tutor to succeed!',
    ar: 'اعثر بسهولة على الأستاذ المناسب للنجاح!',
    tn: 'Matkhamemch, l9a el prof elli yse3dek!',
  },
  'Les meilleurs professeurs et tuteurs vérifiés dans toute la Tunisie': {
    en: 'The best verified teachers and tutors across Tunisia',
    ar: 'أفضل الأساتذة المعتمدين في كامل تونس',
    tn: 'A7san les profs w tlamdha f Tounes bkolha',
  },
  '9arrini • قَرّيني — Trouvez le professeur idéal pour réussir !': {
    en: '9arrini • قَرّيني — Find the ideal tutor to succeed!',
    ar: 'قرّيني • قَرّيني — اعثر على الأستاذ المثالي للنجاح!',
    tn: '9arrini • قَرّيني — Matkhamemch, l9a el prof elli yse3dek!',
  },
  'Nos professeurs experts': {
    en: 'Our expert tutors',
    ar: 'أساتذتنا الخبراء',
    tn: 'A7san les profs m3ana',
  },
  'pour votre réussite !': {
    en: 'for your success!',
    ar: 'لنجاحكم وتفوقكم!',
    tn: 'w tfawwa9 fi 9raytek!',
  },
  'Choisissez le professeur qui vous correspond, réservez vos séances en ligne et progressez rapidement.': {
    en: 'Choose the tutor that fits your needs, book online sessions, and improve your grades quickly.',
    ar: 'اختر الأستاذ المناسب لك، احجز حصصك عبر الإنترنت وتفوق في دراستك بسهولة.',
    tn: 'E5tar el prof elli ywelemk, 7adher drousek, w jib note behya bkol souhoula.',
  },
  'Matières de Soutien Populaires': {
    en: 'Popular Tutoring Subjects',
    ar: 'مواد التدريس الأكثر طلباً',
    tn: 'El Matières elli matloubin barcha',
  },
  'Les meilleurs cours. Les meilleurs professeurs.': {
    en: 'Better lessons. Top tutors.',
    ar: 'أقوى الدروس. أفضل الأساتذة.',
    tn: 'Aqwa drous. A7san profs.',
  },
  'Un chapitre difficile ? Des examens qui approchent ? 9arrini vous connecte avec les meilleurs professeurs et mentors qui expliquent de manière claire et méthodique. Réservez votre séance individuelle en direct et réussissez vos études !': {
    en: 'Struggling with a chapter? Exams coming up? 9arrini connects you with top tutors and mentors who explain concepts clearly. Book your 1-on-1 live session and ace your exams!',
    ar: 'درس صعب؟ الامتحانات قريبة؟ قرّيني يربطك بأفضل الأساتذة لشرح الدروس بطريقة واضحة ومبسطة. احجز حصتك الفردية المباشرة وتفوق في دراستك!',
    tn: 'Fhem s3ib? Dourousek msha3bka? 9arrini tjiblk a7san les profs elli yfasroulek b tari9a sahla w claire. Réservez votre séance 1-on-1 w tfawwa9 fi 9raytek!',
  },
  'Commencer maintenant': {
    en: 'Get started now',
    ar: 'ابدأ الآن',
    tn: 'Ebda tawa',
  },
  'La solution complète pour tous les élèves et étudiants qui visent l’excellence': {
    en: 'The complete solution for students aiming for excellence',
    ar: 'الحل المتكامل لجميع التلاميذ والطلبة الطامحين للتميز',
    tn: 'El solution lkol tlemidha w étudiants elli y7ebbou ynaj7ou',
  },
  'Professeurs vérifiés et expérimentés': {
    en: 'Verified & experienced tutors',
    ar: 'أساتذة معتمدون وذوو خبرة',
    tn: 'Profs vérifiés w expérimentés',
  },
  'Des enseignants et ingénieurs qualifiés pour vous accompagner dans chaque matière.': {
    en: 'Qualified teachers and engineers to guide you in every subject.',
    ar: 'أساتذة ومهندسون أكفاء لمرافقتك في كل مادة.',
    tn: 'Asatdha w ingénieurs kfée y3awnouk f kol sghira w kbira f drousek.',
  },
  'Garantie de compréhension et de qualité': {
    en: 'Quality & understanding guaranteed',
    ar: 'ضمان الفهم والجودة',
    tn: 'Dhaman al fhem w el jawda',
  },
  'Des séances 100% interactives en direct avec un professeur dédié à votre progression.': {
    en: '100% interactive live sessions with a tutor dedicated to your progress.',
    ar: 'حصص تفاعلية 100% مباشرة مع أستاذ مخصص لمتابعتك.',
    tn: 'Séances 100% interactives m3a prof mrakkez m3ak wahdek.',
  },
  'Programme sur mesure': {
    en: 'Tailored study program',
    ar: 'برنامج دراسي على المقاس',
    tn: 'Barnamej 3la 9yasek',
  },
  'Suivez vos progrès séance après séance avec exercices corrigés et révisions.': {
    en: 'Track your progress session by session with graded exercises and review sheets.',
    ar: 'تابع تقدمك حصة بحصة مع تمارين مصلحة ومراجعات.',
    tn: 'Tabba3 el progrès mte3ek séance b séance w sla7 el devoirs.',
  },
  'Tarifs accessibles en Dinars': {
    en: 'Affordable prices in Dinars',
    ar: 'أسعار مناسبة بالدينار التونسي',
    tn: 'As3ar bil Dinar mrigla',
  },
  'Des formules adaptées à tous les budgets (à la séance ou en pack de cours).': {
    en: 'Plans suited to every budget (single sessions or course packages).',
    ar: 'عروض تناسب جميع الميزانيات (بالحصة أو باقات دروس).',
    tn: 'Tarifs fi moutanawal el jami3 (par heure walla pack drous) b soum ma39oul.',
  },
  '🎓 Cours particuliers 1-on-1 & Groupes avec les meilleurs professeurs': {
    en: '🎓 1-on-1 & Group tutoring with top teachers',
    ar: '🎓 دروس خصوصية فردية وجماعية مع أفضل الأساتذة',
    tn: '🎓 Drous 1-on-1 & Groupes m3a a7san asatdha',
  },
  'Comment 9arrini transforme votre façon d’apprendre': {
    en: 'How 9arrini transforms the way you learn',
    ar: 'كيف يغير قرّيني طريقتك في التعلم والدراسة',
    tn: 'Kifech 9arrini tbaddel tari9et 9rayetkom',
  },
  'Des centaines d’élèves et d’étudiants utilisent 9arrini pour améliorer leurs notes et maîtriser de nouvelles compétences.': {
    en: 'Hundreds of students use 9arrini to boost their grades and master new skills.',
    ar: 'مئات التلاميذ والطلبة يستخدمون قرّيني لتحسين أعدادهم واكتساب مهارات جديدة.',
    tn: 'Meyat el tlamdha w el étudiants sta3mlou 9arrini bech yejbdo notes tayara.',
  },
  'Tout commence par un bon professeur qui vous comprend': {
    en: 'Everything starts with a great tutor who understands you',
    ar: 'كل شيء يبدأ بأستاذ متميز يفهم احتياجاتك',
    tn: 'Kol chay yebdà b prof behy yefhmek',
  },
  'Les meilleurs professeurs dans plus de 50 matières et spécialités': {
    en: 'Top teachers across more than 50 subjects and specialties',
    ar: 'أفضل الأساتذة في أكثر من 50 مادة وتخصصاً',
    tn: 'A7san el asatdha f akther men 50 matière w takhasses',
  },
  'Mise en relation simple et rapide avec le professeur adapté à votre niveau': {
    en: 'Fast, easy matching with the right tutor for your academic level',
    ar: 'ربط سريع وسهل مع الأستاذ المناسب لمستواك الدراسي',
    tn: 'Matching sahla w rapide m3a el prof elli ywelem moustewak',
  },
  'Des cours à votre rythme et selon votre budget en Dinars (DT)': {
    en: 'Lessons at your own pace and within your budget in Dinars (DT)',
    ar: 'دروس حسب نسقك وميزانيتك بالدينار التونسي',
    tn: 'Drous 3la 9ad rythm mte3ek w budget mte3ek bil Dinar',
  },
  'Progressez sereinement avec un suivi personnalisé dès la première séance': {
    en: 'Progress confidently with personalized follow-up from the very first lesson',
    ar: 'تقدم بثقة مع متابعة شخصية منذ الحصة الأولى',
    tn: 'Erté7 w tfawwa9 m3a suivi personnalisé men lawwel séance',
  },

  // Categories
  'Informatique & Programmation': {
    en: 'Coding & Computer Science',
    ar: 'الإعلامية والبرمجة',
    tn: 'Informatique & Coding',
  },
  'Arts & Design Graphique': {
    en: 'Art & Graphic Design',
    ar: 'الفنون والتصميم الجرافيكي',
    tn: 'Art & Design',
  },
  'Mathématiques & Statistiques': {
    en: 'Math & Statistics',
    ar: 'الرياضيات والإحصاء',
    tn: 'Math & Statistiques',
  },
  'Langues & Rédaction': {
    en: 'Languages & Writing',
    ar: 'اللغات والتحرير',
    tn: 'Loughat & Rédaction',
  },
  'Physique & Sciences': {
    en: 'Physics & Sciences',
    ar: 'الفيزياء والعلوم',
    tn: 'Physique & Sciences',
  },
  'IA & Science des Données': {
    en: 'AI & Data Science',
    ar: 'الذكاء الاصطناعي وعلوم البيانات',
    tn: 'IA & Data Science',
  },
  'Musique & Instruments': {
    en: 'Music & Instruments',
    ar: 'الموسيقى والآلات',
    tn: 'Mousi9a & Instruments',
  },
  'Économie, Gestion & Finance': {
    en: 'Economics, Business & Finance',
    ar: 'الاقتصاد والتصرف والمالية',
    tn: 'Éco, Gestion & Finance',
  },
  'Préparation Bac & Concours': {
    en: 'Bac & Exam Prep',
    ar: 'التحضير للبكالوريا والمناظرات',
    tn: 'Préparation Bac & Concours',
  },
  'Voir 3 de plus': {
    en: 'View 3 More',
    ar: 'عرض 3 المزيد',
    tn: 'Chouf 3 okhrin',
  },

  // Explore Page
  'Trouvez votre professeur & votre séance': {
    en: 'Find your tutor & your lesson',
    ar: 'اعثر على أستاذك وحصتك الدراسية',
    tn: 'L9a el prof w el séance mte3ek',
  },
  'Parcourez les cours publiés par les professeurs de la plateforme 9arrini': {
    en: 'Browse courses published by verified tutors on the 9arrini platform',
    ar: 'تصفح الدروس المنشورة من قبل أساتذة منصة قرّيني',
    tn: 'Chouf el drous elli habtouhom les profs f 9arrini',
  },
  Rechercher: {
    en: 'Search',
    ar: 'بحث',
    tn: 'Lawwej',
  },
  'Toutes les matières': {
    en: 'All subjects',
    ar: 'جميع المواد',
    tn: 'El matières el kol',
  },
  'Séances publiées récemment': {
    en: 'Recently published sessions',
    ar: 'الحصص المنشورة مؤخراً',
    tn: 'Séances habtou jdod',
  },
  'Cours actifs disponibles à la réservation': {
    en: 'Active lessons available for booking',
    ar: 'دروس نشطة متاحة للحجز',
    tn: 'Drous 7adhrin lel réservation',
  },
  'Aucun cours publié pour le moment': {
    en: 'No courses published yet',
    ar: 'لا توجد دروس منشورة حالياً',
    tn: 'Mafamma 7atta cours mhabbet tawa',
  },
  'Publier un nouveau cours (Espace Prof)': {
    en: 'Publish a new course (Tutor Area)',
    ar: 'نشر درس جديد (فضاء الأستاذ)',
    tn: 'Habbet cours jdid (Espace Prof)',
  },
  Réserver: {
    en: 'Book now',
    ar: 'احجز الآن',
    tn: 'Réservi',
  },
  'Prof Vérifié': {
    en: 'Verified Tutor',
    ar: 'أستاذ معتمد',
    tn: 'Prof Vérifié',
  },
  'En confirmation': {
    en: 'Pending review',
    ar: 'قيد المراجعة',
    tn: 'Fi thabbet',
  },

  // Dashboards & Sidebars
  'Espace Professeur': {
    en: 'Tutor Dashboard',
    ar: 'فضاء الأستاذ',
    tn: 'Espace Prof',
  },
  'Gérer mes Séances': {
    en: 'Manage Sessions',
    ar: 'إدارة حصصي',
    tn: 'Géri el Séances',
  },
  'Messages Élèves': {
    en: 'Student Messages',
    ar: 'رسائل التلاميذ',
    tn: 'Messaget التلاميذ',
  },
  'Publier un Cours': {
    en: 'Create Session',
    ar: 'نشر درس جديد',
    tn: 'Habbet Cours',
  },
  Notifications: {
    en: 'Notifications',
    ar: 'الإشعارات',
    tn: 'Notifications',
  },
  'Profil Professeur': {
    en: 'Tutor Profile',
    ar: 'ملف الأستاذ',
    tn: 'Profil el Prof',
  },
  Accueil: {
    en: 'Home',
    ar: 'الرئيسية',
    tn: 'Accueil',
  },
  'Ressources Pédagogiques': {
    en: 'Teaching Resources',
    ar: 'الموارد التعليمية',
    tn: 'Ressources Pédagogiques',
  },
  'Nouveau Cours': {
    en: 'Quick Create',
    ar: 'إنشاء درس سريع',
    tn: 'Cours Jdid',
  },
  'Espace Élève': {
    en: 'Student Dashboard',
    ar: 'فضاء التلميذ',
    tn: 'Espace Élève',
  },
  'Solde Points (1 Pt = 1 DT)': {
    en: 'Points Wallet (1 Pt = 1 DT)',
    ar: 'رصيد النقاط (1 نقطة = 1 د.ت)',
    tn: 'Solde Points (1 Pt = 1 DT)',
  },
  'Messages Professeurs': {
    en: 'Tutor Messages',
    ar: 'رسائل الأساتذة',
    tn: 'Messaget les Profs',
  },
  'Profil Élève': {
    en: 'Student Profile',
    ar: 'ملف التلميذ',
    tn: 'Profil Élève',
  },
  'Trouver un Professeur': {
    en: 'Find a Tutor',
    ar: 'ابحث عن أستاذ',
    tn: 'Lawwej 3la Prof',
  },
  'Aucune séance active réservée': {
    en: 'No active lessons booked',
    ar: 'لا توجد حصص نشطة محجوزة',
    tn: 'Mafamma 7atta séance active tawa',
  },
  'Parcourez les professeurs vérifiés et réservez votre première séance individuelle.': {
    en: 'Browse verified tutors and book your first 1-on-1 lesson.',
    ar: 'تصفح الأساتذة المعتمدين واحجز حصتك الفردية الأولى.',
    tn: 'Chouf les profs vérifiés w réservi awwel séance 1-on-1.',
  },
  'Séance d’apprentissage actuelle': {
    en: 'Current Learning Session',
    ar: 'حصة التعلم الحالية',
    tn: 'El séance mte3ek tawa',
  },
  'Prêt à apprendre': {
    en: 'Ready to Learn',
    ar: 'جاهز للتعلم',
    tn: '7adher lel 9raya',
  },
  'Revenus Totaux des Cours': {
    en: 'Total Tutoring Earnings',
    ar: 'إجمالي مداخيل الدروس',
    tn: 'Total el Madakhil',
  },
  'Demandes d’Élèves en Attente': {
    en: 'Pending Student Requests',
    ar: 'طلبات التلاميذ قيد الانتظار',
    tn: 'Demandes tlamdha يستناو',
  },
  'Aucune demande en attente pour le moment 🎯': {
    en: 'No pending student requests right now 🎯',
    ar: 'لا توجد طلبات قيد الانتظار حالياً 🎯',
    tn: 'Mafamma 7atta demande تستنى tawa 🎯',
  },
  'Aucune séance active pour le moment': {
    en: 'No active lesson yet',
    ar: 'لا توجد حصة نشطة حالياً',
    tn: 'Mafamma 7atta séance active tawa',
  },
  '+ Créer une Séance de Cours': {
    en: '+ Create Tutoring Session',
    ar: '+ إنشاء حصة درس',
    tn: '+ A3mel Séance Jdida',
  },
  Disponibilité: {
    en: 'Availability',
    ar: 'أوقات التوفر',
    tn: 'Disponibilité',
  },
  'Vos réservations acceptées bloquent automatiquement les dates': {
    en: 'Your accepted bookings automatically block dates',
    ar: 'الحجوزات المقبولة تحجز التواريخ تلقائياً',
    tn: 'El réservations elli 9belthom yetsajlou automatique fil calendrier',
  },
  'Réservations actives': {
    en: 'Active bookings',
    ar: 'الحجوزات النشطة',
    tn: 'Réservations actives',
  },
  'Jours occupés au total': {
    en: 'Total busy days',
    ar: 'إجمالي الأيام المشغولة',
    tn: 'Total eyyemet el 9raya',
  },
  'Aucune notification pour le moment': {
    en: 'No notifications yet',
    ar: 'لا توجد إشعارات حتى الآن',
    tn: 'Mafamma 7atta notification tawa',
  },
  'Vous êtes à jour !': {
    en: 'You’re all caught up!',
    ar: 'أنت مطلع على كل جديد!',
    tn: 'Kol chay mrigel!',
  },
  '© 9arrini — Plateforme Éducative N°1 en Tunisie 2026.': {
    en: '© 9arrini — #1 Educational Tutoring Platform in Tunisia 2026.',
    ar: '© قرّيني — المنصة التعليمية الأولى في تونس 2026.',
    tn: '© 9arrini — Plateforme Éducative N°1 fi Tounes 2026.',
  },
};

const PLACEHOLDER_TRANSLATIONS: Record<
  string,
  {en: string; ar: string; tn: string}
> = {
  'Rechercher une matière, un cours ou un professeur...': {
    en: 'Search for a subject, course, or tutor...',
    ar: 'ابحث عن مادة، درس أو أستاذ...',
    tn: 'Lawwej 3la matière, cours walla prof...',
  },
  'Ex: Mathématiques, Python, Anglais, Bac...': {
    en: 'Try Math, Python, English, Bac Prep...',
    ar: 'مثال: رياضيات، بايثون، إنجليزية، بكالوريا...',
    tn: 'Jarreb Math, Python, Anglais, Bac...',
  },
  'Rechercher une matière, un professeur ou un cours (Math, Python, Anglais...)...': {
    en: 'Search any subject, tutor, or course (Math, Python, English...)...',
    ar: 'ابحث عن أي مادة، أستاذ أو درس (رياضيات، بايثون، إنجليزية...)...',
    tn: 'Lawwej 3la ay matière, prof, walla cours (Math, Python, Anglais...)...',
  },
};

interface LanguageContextValue {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: (frenchText: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'fr',
  setLocale: () => {},
  t: (text: string) => text,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

const originalTextMap = new WeakMap<Text, string>();
const originalPlaceholderMap = new WeakMap<Element, string>();

function applyDomTranslations(locale: Locale) {
  if (typeof document === 'undefined') return;

  const langMeta = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];
  document.documentElement.lang = locale === 'tn' ? 'ar-TN' : locale;
  document.documentElement.dir = langMeta.dir;

  // Walk text nodes
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const textNode = node as Text;
    const parentTag = textNode.parentElement?.tagName;
    if (parentTag === 'SCRIPT' || parentTag === 'STYLE' || parentTag === 'TEXTAREA') {
      continue;
    }

    const currentVal = textNode.nodeValue || '';
    const trimmed = currentVal.trim();
    if (!trimmed) continue;

    let baseFrench = originalTextMap.get(textNode);
    if (!baseFrench) {
      if (PHRASE_TRANSLATIONS[trimmed]) {
        baseFrench = trimmed;
        originalTextMap.set(textNode, trimmed);
      }
    }

    if (baseFrench && PHRASE_TRANSLATIONS[baseFrench]) {
      const targetText =
        locale === 'fr' ? baseFrench : PHRASE_TRANSLATIONS[baseFrench][locale];
      if (targetText && trimmed !== targetText) {
        textNode.nodeValue = currentVal.replace(trimmed, targetText);
      }
    }
  }

  // Translate input placeholders
  const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
  inputs.forEach(el => {
    const currentPh = el.getAttribute('placeholder') || '';
    let baseFrenchPh = originalPlaceholderMap.get(el);
    if (!baseFrenchPh && PLACEHOLDER_TRANSLATIONS[currentPh]) {
      baseFrenchPh = currentPh;
      originalPlaceholderMap.set(el, currentPh);
    }
    if (baseFrenchPh && PLACEHOLDER_TRANSLATIONS[baseFrenchPh]) {
      const nextPh =
        locale === 'fr' ? baseFrenchPh : PLACEHOLDER_TRANSLATIONS[baseFrenchPh][locale];
      if (nextPh && currentPh !== nextPh) {
        el.setAttribute('placeholder', nextPh);
      }
    }
  });
}

export function LanguageProvider({children}: {children: React.ReactNode}) {
  const [locale, setLocaleState] = useState<Locale>('fr');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && ['fr', 'en', 'ar', 'tn'].includes(saved)) {
        setLocaleState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
      document.cookie = `${STORAGE_KEY}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (frenchText: string): string => {
      if (locale === 'fr') return frenchText;
      const entry = PHRASE_TRANSLATIONS[frenchText];
      if (!entry) return frenchText;
      return entry[locale] || frenchText;
    },
    [locale]
  );

  useEffect(() => {
    applyDomTranslations(locale);
    const observer = new MutationObserver(() => {
      applyDomTranslations(locale);
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [locale]);

  return (
    <LanguageContext.Provider value={{locale, setLocale, t}}>
      {children}
    </LanguageContext.Provider>
  );
}

export function LanguageSwitcher({compact = false}: {compact?: boolean}) {
  const {locale, setLocale} = useLanguage();
  const current = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 px-2.5 text-xs font-semibold border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-900 rounded-full"
          title="Changer la langue / Change language"
        >
          <Globe className="h-3.5 w-3.5 text-emerald-600" />
          <span>{current.flag}</span>
          <span className={compact ? 'inline' : 'hidden sm:inline'}>{current.label}</span>
          {!compact && <span className="sm:hidden">{current.shortLabel}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 p-1.5">
        {LANGUAGES.map(lang => {
          const isActive = lang.code === locale;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLocale(lang.code)}
              className={`cursor-pointer flex items-center justify-between text-xs py-2 px-2.5 rounded-md ${
                isActive ? 'bg-emerald-50 text-emerald-800 font-bold' : 'font-medium'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-sm">{lang.flag}</span>
                <span>{lang.label}</span>
              </span>
              {isActive && <Check className="h-3.5 w-3.5 text-emerald-600" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
