'use client';

import {useState} from 'react';
import {
  adminVerifyTutor,
  adminAdjustStudentPoints,
  adminUpdateBookingStatus,
  adminUpdateServiceStatus,
  adminDeleteService,
  getAdminDashboardData,
} from '@/hooks/admin/admin-actions';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Input} from '@/components/ui/input';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  Coins,
  BookOpen,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Trash2,
  PlusCircle,
  MinusCircle,
  ExternalLink,
  AlertTriangle,
  History,
} from 'lucide-react';
import {toast} from 'sonner';
import Link from 'next/link';

interface AdminDashboardProps {
  initialData: Awaited<ReturnType<typeof getAdminDashboardData>>;
}

export function AdminDashboardClient({initialData}: AdminDashboardProps) {
  const [data, setData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Filters
  const [tutorSearch, setTutorSearch] = useState('');
  const [tutorFilter, setTutorFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'UNVERIFIED'>('ALL');
  const [studentSearch, setStudentSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [customPointsMap, setCustomPointsMap] = useState<Record<string, string>>({});

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const fresh = await getAdminDashboardData();
      if (fresh.success) {
        setData(fresh);
        toast.success('Données administrateur actualisées');
      }
    } catch {
      toast.error('Erreur lors du rafraîchissement');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!data.success) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive font-semibold">Erreur de chargement du panneau Admin.</p>
      </div>
    );
  }

  const {
    stats,
    sellers = [],
    students = [],
    bookings = [],
    services = [],
    recentTransactions = [],
  } = data;

  const handleVerifyTutor = async (sellerId: string, verify: boolean) => {
    setLoadingId(sellerId);
    try {
      const res = await adminVerifyTutor(sellerId, verify);
      if (res.success) {
        toast.success(res.message);
        await refreshData();
      } else {
        toast.error(res.error || 'Action impossible');
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleAdjustPoints = async (userId: string, amount: number, reason?: string) => {
    if (!amount || isNaN(amount)) {
      toast.error('Montant invalide');
      return;
    }
    setLoadingId(userId);
    try {
      const res = await adminAdjustStudentPoints(userId, amount, reason);
      if (res.success) {
        toast.success(res.message);
        setCustomPointsMap(prev => ({...prev, [userId]: ''}));
        await refreshData();
      } else {
        toast.error(res.error || 'Action impossible');
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleBookingStatus = async (bookingId: string, status: any) => {
    setLoadingId(bookingId);
    try {
      const res = await adminUpdateBookingStatus(bookingId, status);
      if (res.success) {
        toast.success(res.message);
        await refreshData();
      } else {
        toast.error(res.error || 'Action impossible');
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleServiceStatus = async (serviceId: string, status: 'ACTIVE' | 'PAUSED' | 'REJECTED') => {
    setLoadingId(serviceId);
    try {
      const res = await adminUpdateServiceStatus(serviceId, status);
      if (res.success) {
        toast.success(res.message);
        await refreshData();
      } else {
        toast.error(res.error || 'Action impossible');
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    setLoadingId(serviceId);
    try {
      const res = await adminDeleteService(serviceId);
      if (res.success) {
        toast.success(res.message);
        await refreshData();
      } else {
        toast.error(res.error || 'Suppression impossible');
      }
    } finally {
      setLoadingId(null);
    }
  };

  const filteredSellers = sellers.filter(s => {
    const matchesQuery =
      s.user.name.toLowerCase().includes(tutorSearch.toLowerCase()) ||
      s.user.email.toLowerCase().includes(tutorSearch.toLowerCase()) ||
      (s.specialty || '').toLowerCase().includes(tutorSearch.toLowerCase());
    if (!matchesQuery) return false;
    if (tutorFilter === 'VERIFIED') return s.verified === true;
    if (tutorFilter === 'PENDING') return !s.verified && s.verificationStatus === 'PENDING';
    if (tutorFilter === 'UNVERIFIED') return !s.verified;
    return true;
  });

  const filteredStudents = students.filter(
    u =>
      u.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredBookings = bookings.filter(
    b =>
      b.client.name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.seller.user.name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.service.title.toLowerCase().includes(bookingSearch.toLowerCase())
  );

  const filteredServices = services.filter(
    srv =>
      srv.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
      srv.seller.user.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
      (srv.category?.name || '').toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950">
      {/* Top Hidden Admin Header */}
      <header className="border-b bg-slate-900 text-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center font-extrabold text-slate-950">
              9
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight">
                  9arrini • Centre de Contrôle Administrateur
                </h1>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                  Accès Privé Non-Indexé
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Vérification Profs • Comptes Élèves & Points (1 Pt = 1 DT) • Achats & Modération Cours
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isRefreshing}
              className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              asChild
            >
              <Link href="/">
                Voir le site public
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-emerald-500/20 shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between text-xs font-medium">
                <span>Volume Total des Achats</span>
                <ShoppingBag className="h-4 w-4 text-emerald-600" />
              </CardDescription>
              <CardTitle className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                {stats?.totalRevenuePoints ?? 0} DT ({stats?.totalRevenuePoints ?? 0} Pts)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {stats?.totalBookings ?? 0} réservations de séances au total
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between text-xs font-medium">
                <span>Professeurs & Confirmation</span>
                <GraduationCap className="h-4 w-4 text-amber-600" />
              </CardDescription>
              <CardTitle className="text-2xl font-extrabold">
                {stats?.verifiedTutors ?? 0} / {stats?.totalTutors ?? 0} Vérifiés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                ⏳ {stats?.pendingTutors ?? 0} prof(s) en attente de confirmation
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between text-xs font-medium">
                <span>Comptes Élèves & Points</span>
                <Coins className="h-4 w-4 text-blue-600" />
              </CardDescription>
              <CardTitle className="text-2xl font-extrabold">
                {stats?.totalStudents ?? 0} Élèves
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Solde cumulé : <strong>{stats?.totalPointsInCirculation ?? 0} Pts (DT)</strong>
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between text-xs font-medium">
                <span>Cours & Séances Publiés</span>
                <BookOpen className="h-4 w-4 text-purple-600" />
              </CardDescription>
              <CardTitle className="text-2xl font-extrabold">
                {stats?.activeServices ?? 0} Actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Sur {stats?.totalServices ?? 0} cours enregistrés
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Operational Tabs */}
        <Tabs defaultValue="tutors" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1.5 bg-slate-200/80 dark:bg-slate-900 p-1.5 rounded-xl">
            <TabsTrigger value="tutors" className="gap-2 text-xs sm:text-sm py-2 px-3.5 rounded-lg">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Professeurs & Statut Vérifié ({sellers.length})</span>
              {(stats?.pendingTutors ?? 0) > 0 && (
                <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">
                  {stats?.pendingTutors}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger value="students" className="gap-2 text-xs sm:text-sm py-2 px-3.5 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
              <span>Comptes Élèves & Points ({students.length})</span>
            </TabsTrigger>

            <TabsTrigger value="bookings" className="gap-2 text-xs sm:text-sm py-2 px-3.5 rounded-lg">
              <ShoppingBag className="h-4 w-4 text-emerald-600" />
              <span>Tous les Achats / Séances ({bookings.length})</span>
            </TabsTrigger>

            <TabsTrigger value="courses" className="gap-2 text-xs sm:text-sm py-2 px-3.5 rounded-lg">
              <BookOpen className="h-4 w-4 text-purple-600" />
              <span>Modération des Cours ({services.length})</span>
            </TabsTrigger>

            <TabsTrigger value="transactions" className="gap-2 text-xs sm:text-sm py-2 px-3.5 rounded-lg">
              <History className="h-4 w-4 text-slate-600" />
              <span>Flux Points ({recentTransactions.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: TUTORS & VERIFICATION */}
          <TabsContent value="tutors" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">
                      Confirmation & Vérification des Professeurs
                    </CardTitle>
                    <CardDescription>
                      Vérifiez les diplômes et dossiers des tuteurs avant d&apos;accorder le badge
                      officiel « Prof Vérifié ✓ ».
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-64">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher prof, email, matière..."
                        value={tutorSearch}
                        onChange={e => setTutorSearch(e.target.value)}
                        className="pl-9 h-9 text-xs"
                      />
                    </div>
                    <div className="flex gap-1">
                      {(['ALL', 'PENDING', 'VERIFIED', 'UNVERIFIED'] as const).map(f => (
                        <Button
                          key={f}
                          variant={tutorFilter === f ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTutorFilter(f)}
                          className="h-8 text-xs"
                        >
                          {f === 'ALL'
                            ? 'Tous'
                            : f === 'PENDING'
                            ? '⏳ En attente'
                            : f === 'VERIFIED'
                            ? '✓ Vérifiés'
                            : 'Non vérifiés'}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
                        <th className="p-3">Professeur</th>
                        <th className="p-3">Spécialité & Diplômes</th>
                        <th className="p-3">Cours & Séances</th>
                        <th className="p-3">Solde Gagné</th>
                        <th className="p-3">Statut Vérification</th>
                        <th className="p-3 text-right">Actions Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredSellers.map(seller => (
                        <tr key={seller.id} className="hover:bg-muted/30">
                          <td className="p-3 align-top">
                            <div className="font-bold text-foreground">{seller.user.name}</div>
                            <div className="text-xs text-muted-foreground">{seller.user.email}</div>
                            {seller.phone && (
                              <div className="text-xs text-emerald-700 font-medium mt-0.5">
                                📞 {seller.phone}
                              </div>
                            )}
                          </td>

                          <td className="p-3 align-top max-w-md">
                            <div className="space-y-1">
                              {seller.specialty ? (
                                <Badge variant="secondary" className="text-xs">
                                  🎓 {seller.specialty}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">
                                  Spécialité non renseignée
                                </span>
                              )}
                              {seller.credentials && (
                                <p className="text-xs font-medium text-foreground">
                                  📜 {seller.credentials}
                                </p>
                              )}
                              {seller.experience && (
                                <p className="text-xs text-muted-foreground">
                                  ⏱️ Expérience : {seller.experience}
                                </p>
                              )}
                              {seller.bio && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {seller.bio}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="p-3 align-top text-xs">
                            <div>
                              <strong>{seller._count.services}</strong> cours publiés
                            </div>
                            <div className="text-muted-foreground">
                              <strong>{seller._count.bookings}</strong> élèves inscrits
                            </div>
                          </td>

                          <td className="p-3 align-top">
                            <span className="font-bold text-emerald-700">
                              {seller.user.points} DT
                            </span>
                            <div className="text-[11px] text-muted-foreground">
                              ({seller.user.points} Pts)
                            </div>
                          </td>

                          <td className="p-3 align-top">
                            {seller.verified ? (
                              <Badge className="bg-emerald-600 text-white text-xs gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                VERIFIED ✓
                              </Badge>
                            ) : seller.verificationStatus === 'PENDING' ? (
                              <Badge className="bg-amber-500 text-white text-xs gap-1">
                                <Clock className="h-3 w-3" />
                                EN ATTENTE (PENDING)
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                NON VÉRIFIÉ
                              </Badge>
                            )}
                          </td>

                          <td className="p-3 align-top text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!seller.verified ? (
                                <Button
                                  size="sm"
                                  disabled={loadingId === seller.id}
                                  onClick={() => handleVerifyTutor(seller.id, true)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                  Confirmer & Vérifier ✓
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={loadingId === seller.id}
                                  onClick={() => handleVerifyTutor(seller.id, false)}
                                  className="border-destructive/40 text-destructive hover:bg-destructive/10 text-xs h-8"
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-1" />
                                  Révoquer
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredSellers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground">
                            Aucun professeur trouvé pour ce filtre.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: STUDENT ACCOUNTS & POINTS WALLET MANAGEMENT */}
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">
                      Comptes Élèves & Gestion des Soldes Points (1 Point = 1 DT)
                    </CardTitle>
                    <CardDescription>
                      Consultez tous les comptes étudiants et créditez ou ajustez leurs Points en 1
                      clic.
                    </CardDescription>
                  </div>
                  <div className="relative w-72">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un élève par nom ou email..."
                      value={studentSearch}
                      onChange={e => setStudentSearch(e.target.value)}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
                        <th className="p-3">Élève / Étudiant</th>
                        <th className="p-3">Rôle</th>
                        <th className="p-3">Solde Actuel (Pts / DT)</th>
                        <th className="p-3">Séances Réservées</th>
                        <th className="p-3">Total Dépensé</th>
                        <th className="p-3 text-right">Créditer / Ajuster Points (1 Pt = 1 DT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredStudents.map(student => (
                        <tr key={student.id} className="hover:bg-muted/30">
                          <td className="p-3">
                            <div className="font-bold">{student.name}</div>
                            <div className="text-xs text-muted-foreground">{student.email}</div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs">
                              {student.role}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1.5 font-extrabold text-base text-emerald-700 dark:text-emerald-400">
                              <Coins className="h-4 w-4 text-emerald-600" />
                              {student.points} Pts ({student.points} DT)
                            </span>
                          </td>
                          <td className="p-3 text-xs">
                            <strong>{student._count.bookings}</strong> réservation(s)
                          </td>
                          <td className="p-3 text-xs font-semibold">
                            {student.totalSpent} DT ({student.totalSpent} Pts)
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={loadingId === student.id}
                                onClick={() =>
                                  handleAdjustPoints(
                                    student.id,
                                    25,
                                    'Recharge Admin (+25 Pts / 25 DT)'
                                  )
                                }
                                className="h-7 text-xs border-emerald-500/40 text-emerald-700 hover:bg-emerald-50"
                              >
                                <PlusCircle className="h-3 w-3 mr-1" />
                                +25 Pts
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={loadingId === student.id}
                                onClick={() =>
                                  handleAdjustPoints(
                                    student.id,
                                    50,
                                    'Recharge Admin (+50 Pts / 50 DT)'
                                  )
                                }
                                className="h-7 text-xs border-emerald-500/40 text-emerald-700 hover:bg-emerald-50"
                              >
                                +50 Pts
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={loadingId === student.id}
                                onClick={() =>
                                  handleAdjustPoints(
                                    student.id,
                                    100,
                                    'Recharge Admin (+100 Pts / 100 DT)'
                                  )
                                }
                                className="h-7 text-xs border-emerald-500/40 text-emerald-700 hover:bg-emerald-50"
                              >
                                +100 Pts
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={loadingId === student.id || student.points < 10}
                                onClick={() =>
                                  handleAdjustPoints(
                                    student.id,
                                    -10,
                                    'Ajustement Admin (-10 Pts / -10 DT)'
                                  )
                                }
                                className="h-7 text-xs border-amber-500/40 text-amber-700"
                              >
                                <MinusCircle className="h-3 w-3 mr-1" />
                                -10
                              </Button>
                              <div className="flex items-center gap-1 ml-1">
                                <Input
                                  type="number"
                                  placeholder="Pts"
                                  value={customPointsMap[student.id] || ''}
                                  onChange={e =>
                                    setCustomPointsMap(prev => ({
                                      ...prev,
                                      [student.id]: e.target.value,
                                    }))
                                  }
                                  className="w-16 h-7 text-xs px-2"
                                />
                                <Button
                                  size="sm"
                                  disabled={
                                    loadingId === student.id || !customPointsMap[student.id]
                                  }
                                  onClick={() =>
                                    handleAdjustPoints(
                                      student.id,
                                      Number(customPointsMap[student.id]),
                                      'Ajustement personnalisé Admin'
                                    )
                                  }
                                  className="h-7 text-xs bg-slate-900 text-white px-2.5"
                                >
                                  OK
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: ALL PURCHASES / BOOKINGS */}
          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">
                      Historique Complet des Achats & Réservations de Séances
                    </CardTitle>
                    <CardDescription>
                      Suivez chaque achat de cours en Points/Dinars et gérez l&apos;état des séances.
                    </CardDescription>
                  </div>
                  <div className="relative w-72">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Filtrer par élève, prof ou cours..."
                      value={bookingSearch}
                      onChange={e => setBookingSearch(e.target.value)}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
                        <th className="p-3">Date</th>
                        <th className="p-3">Élève (Acheteur)</th>
                        <th className="p-3">Professeur</th>
                        <th className="p-3">Cours & Pack</th>
                        <th className="p-3">Montant Payé</th>
                        <th className="p-3">Statut</th>
                        <th className="p-3 text-right">Changer le Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredBookings.map(booking => (
                        <tr key={booking.id} className="hover:bg-muted/30">
                          <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(booking.createdAt).toLocaleDateString('fr-TN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="p-3">
                            <div className="font-semibold">{booking.client.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {booking.client.email}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">{booking.seller.user.name}</span>
                              {booking.seller.verified && (
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                              )}
                            </div>
                          </td>
                          <td className="p-3 max-w-xs">
                            <div className="font-medium line-clamp-1">{booking.service.title}</div>
                            <Badge variant="secondary" className="text-[10px] mt-0.5">
                              Pack {booking.servicePackageTier}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-emerald-700">
                              {booking.price} Pts ({booking.price} DT)
                            </span>
                          </td>
                          <td className="p-3">
                            <Badge
                              variant={
                                booking.status === 'COMPLETED' || booking.status === 'CONFIRMED'
                                  ? 'default'
                                  : booking.status === 'CANCELLED'
                                  ? 'destructive'
                                  : 'outline'
                              }
                              className="text-xs"
                            >
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <select
                              value={booking.status}
                              disabled={loadingId === booking.id}
                              onChange={e => handleBookingStatus(booking.id, e.target.value)}
                              className="h-8 rounded-md border bg-background px-2 text-xs font-medium"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="IN_PROGRESS">IN_PROGRESS</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                      {filteredBookings.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-muted-foreground">
                            Aucun achat enregistré pour le moment.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: COURSES & ANTI-SPAM MODERATION */}
          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">
                      Modération des Cours & Qualité Pédagogique
                    </CardTitle>
                    <CardDescription>
                      Vérifiez la présentation des cours publiés par les professeurs et suspendez ou
                      supprimez tout contenu incomplet.
                    </CardDescription>
                  </div>
                  <div className="relative w-72">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un cours ou un prof..."
                      value={courseSearch}
                      onChange={e => setCourseSearch(e.target.value)}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
                        <th className="p-3">Titre du Cours</th>
                        <th className="p-3">Professeur</th>
                        <th className="p-3">Catégorie</th>
                        <th className="p-3">Tarif (Pts / DT)</th>
                        <th className="p-3">Statut</th>
                        <th className="p-3 text-right">Actions Modération</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredServices.map(srv => {
                        const minPrice =
                          Math.min(...srv.packages.map((p: {price: number}) => p.price)) || 0;
                        const isShortSpam = srv.title.trim().split(/\s+/).length < 3;
                        return (
                          <tr key={srv.id} className="hover:bg-muted/30">
                            <td className="p-3 max-w-sm">
                              <div className="flex items-start gap-2">
                                <div>
                                  <Link
                                    href={`/service/${srv.slug}`}
                                    className="font-bold hover:underline text-foreground line-clamp-2"
                                  >
                                    {srv.title}
                                  </Link>
                                  {isShortSpam && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium mt-0.5">
                                      <AlertTriangle className="h-3 w-3" />
                                      Titre court (auto-formaté côté élève)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium">{srv.seller.user.name}</span>
                                {srv.seller.verified ? (
                                  <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0">
                                    Vérifié ✓
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    Non vérifié
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-xs">{srv.category?.name || 'Général'}</td>
                            <td className="p-3 font-bold text-emerald-700">
                              Dès {minPrice} Pts ({minPrice} DT)
                            </td>
                            <td className="p-3">
                              <Badge
                                variant={
                                  srv.status === 'ACTIVE'
                                    ? 'default'
                                    : srv.status === 'REJECTED'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {srv.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {srv.status !== 'ACTIVE' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={loadingId === srv.id}
                                    onClick={() => handleServiceStatus(srv.id, 'ACTIVE')}
                                    className="h-7 text-xs border-emerald-500/40 text-emerald-700"
                                  >
                                    Activer
                                  </Button>
                                )}
                                {srv.status === 'ACTIVE' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={loadingId === srv.id}
                                    onClick={() => handleServiceStatus(srv.id, 'PAUSED')}
                                    className="h-7 text-xs"
                                  >
                                    Pause
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={loadingId === srv.id}
                                  onClick={() => handleDeleteService(srv.id)}
                                  className="h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: RECENT POINT TRANSACTIONS */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Journal des Transactions de Points (1 Point = 1 DT)
                </CardTitle>
                <CardDescription>
                  Toutes les recharges élèves, réservations de cours et rémunérations professeurs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
                        <th className="p-3">Date</th>
                        <th className="p-3">Compte Utilisateur</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Description</th>
                        <th className="p-3 text-right">Montant (Pts / DT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {recentTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-muted/30">
                          <td className="p-3 text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleString('fr-TN')}
                          </td>
                          <td className="p-3">
                            <div className="font-medium">{tx.user.name}</div>
                            <div className="text-xs text-muted-foreground">{tx.user.email}</div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs">
                              {tx.type}
                            </Badge>
                          </td>
                          <td className="p-3 text-xs">{tx.description}</td>
                          <td
                            className={`p-3 text-right font-bold ${
                              tx.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {tx.amount >= 0 ? `+${tx.amount}` : tx.amount} Pts ({tx.amount} DT)
                          </td>
                        </tr>
                      ))}
                      {recentTransactions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            Aucune transaction enregistrée.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
