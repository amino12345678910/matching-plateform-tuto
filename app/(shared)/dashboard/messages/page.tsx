'use client';

import {useEffect, useState, useRef} from 'react';
import {getUserInfo} from '@/hooks/shared/get-user-info';
import {FALLBACK_SERVICES} from '@/lib/fallback-data';
import {getServiceMeetInfo} from '@/lib/google-meet';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
import {
  Send,
  Video,
  MessageCircle,
  Search,
  CheckCheck,
  Calendar,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import {cn} from '@/lib/utils';

interface ChatMessageItem {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  isMe: boolean;
}

interface ChatContact {
  id: string;
  name: string;
  specialty: string;
  courseTitle: string;
  courseSlug: string;
  avatar: string;
  phone: string;
  meetUrl: string;
  scheduleLabel: string;
  online: boolean;
}

const CHAT_STORAGE_KEY = '9arrini_chat_history_v1';

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    role: string;
  } | null>(null);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [activeContact, setActiveContact] = useState<ChatContact | null>(null);
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, ChatMessageItem[]>>({});
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const u = await getUserInfo();
      const myId = u.userId || 'guest_student';
      const myName = u.name || 'Élève 9arrini';
      const myRole = u.role || 'USER';
      setCurrentUser({id: myId, name: myName, role: myRole});

      // Build tutor contacts from 9arrini courses + any URL parameters
      const params = new URLSearchParams(window.location.search);
      const qTutorId = params.get('tutorId');
      const qTutorName = params.get('tutorName');
      const qCourse = params.get('course');

      const baseContacts: ChatContact[] = FALLBACK_SERVICES.map(s => {
        const meet = getServiceMeetInfo(s as any);
        const tName = s.seller.user.name;
        return {
          id: s.freelancerId || s.seller.userId,
          name: tName,
          specialty: s.category?.name || 'Soutien Scolaire',
          courseTitle: s.title,
          courseSlug: s.slug,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            tName
          )}&background=059669&color=fff&bold=true`,
          phone: '+21622410112',
          meetUrl: meet.meetUrl,
          scheduleLabel: meet.formattedDateLabel,
          online: true,
        };
      });

      // Deduplicate by tutor id
      const uniqueMap = new Map<string, ChatContact>();
      for (const c of baseContacts) {
        if (!uniqueMap.has(c.id)) uniqueMap.set(c.id, c);
      }

      if (qTutorId && qTutorName && !uniqueMap.has(qTutorId)) {
        const meet = getServiceMeetInfo({
          slug: qCourse || 'session',
          title: qCourse || 'Cours 9arrini',
        });
        uniqueMap.set(qTutorId, {
          id: qTutorId,
          name: qTutorName,
          specialty: 'Professeur 9arrini',
          courseTitle: qCourse || 'Séance de soutien',
          courseSlug: 'bac-math-revision-intensive-tunis',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            qTutorName
          )}&background=059669&color=fff&bold=true`,
          phone: '+21622410112',
          meetUrl: meet.meetUrl,
          scheduleLabel: meet.formattedDateLabel,
          online: true,
        });
      }

      const finalContacts = Array.from(uniqueMap.values());
      setContacts(finalContacts);

      const initialTarget =
        (qTutorId && finalContacts.find(c => c.id === qTutorId)) || finalContacts[0] || null;
      setActiveContact(initialTarget);
      if (qTutorId) setMobileShowChat(true);

      // Load saved chat messages or seed initial greeting
      let stored: Record<string, ChatMessageItem[]> = {};
      try {
        const raw = localStorage.getItem(CHAT_STORAGE_KEY);
        if (raw) stored = JSON.parse(raw);
      } catch {
        // ignore
      }

      const seeded: Record<string, ChatMessageItem[]> = {...stored};
      for (const c of finalContacts) {
        if (!seeded[c.id] || seeded[c.id].length === 0) {
          seeded[c.id] = [
            {
              id: `welcome_${c.id}`,
              senderId: c.id,
              senderName: c.name,
              text: `Mar7bé bik ${myName} ! Je suis ${c.name} (${c.specialty}). N'hésitez pas à m'écrire vos questions concernant "${c.courseTitle}" ou votre séance Google Meet prévue le ${c.scheduleLabel}.`,
              createdAt: new Date().toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              isMe: false,
            },
          ];
        }
      }
      setMessagesByRoom(seeded);
    };

    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [activeContact, messagesByRoom]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContact || !currentUser) return;

    const nowTime = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const myMsg: ChatMessageItem = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: inputText.trim(),
      createdAt: nowTime,
      isMe: true,
    };

    const roomMsgs = messagesByRoom[activeContact.id] || [];
    const updatedRoom = [...roomMsgs, myMsg];
    const nextState = {...messagesByRoom, [activeContact.id]: updatedRoom};
    setMessagesByRoom(nextState);
    setInputText('');

    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(nextState));
    } catch {
      // ignore
    }

    // Automatic helpful tutor reply after 1s
    const targetTutor = activeContact;
    setTimeout(() => {
      const replyMsg: ChatMessageItem = {
        id: `reply_${Date.now()}`,
        senderId: targetTutor.id,
        senderName: targetTutor.name,
        text: `Merci pour votre message ! J'ai bien noté votre demande pour "${targetTutor.courseTitle}". Notre séance est planifiée le ${targetTutor.scheduleLabel}. Vous pouvez aussi me joindre directement sur WhatsApp ou via le bouton Google Meet une fois la séance réservée.`,
        createdAt: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isMe: false,
      };
      setMessagesByRoom(prev => {
        const list = prev[targetTutor.id] || [];
        const updated = {...prev, [targetTutor.id]: [...list, replyMsg]};
        try {
          localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    }, 900);
  };

  const filteredContacts = contacts.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMessages = activeContact ? messagesByRoom[activeContact.id] || [] : [];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background border rounded-xl overflow-hidden m-2 sm:m-4 shadow-xs">
      {/* Left Sidebar: Tutors & Students List */}
      <aside
        className={cn(
          'w-full md:w-80 border-r flex flex-col bg-slate-50/50 dark:bg-slate-950/40',
          mobileShowChat && 'hidden md:flex'
        )}
      >
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2">
              <span>Messagerie 9arrini</span>
              <Badge className="bg-emerald-600 text-white text-[10px]">Direct</Badge>
            </h2>
          </div>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un professeur ou matière..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-lg bg-background"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y">
          {filteredContacts.map(contact => {
            const lastMsg = (messagesByRoom[contact.id] || []).slice(-1)[0];
            const isSelected = activeContact?.id === contact.id;
            return (
              <button
                key={contact.id}
                type="button"
                onClick={() => {
                  setActiveContact(contact);
                  setMobileShowChat(true);
                }}
                className={cn(
                  'w-full text-left p-3.5 flex items-start gap-3 transition hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20 cursor-pointer',
                  isSelected && 'bg-emerald-50/90 dark:bg-emerald-950/40 border-l-4 border-emerald-600'
                )}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-10 w-10 border border-emerald-500/20">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback>{contact.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute bottom-0 right-0" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold truncate">{contact.name}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {lastMsg?.createdAt || 'En ligne'}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 truncate">
                    {contact.specialty}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {lastMsg?.text || contact.courseTitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Right Chat Conversation Area */}
      {activeContact ? (
        <div
          className={cn(
            'flex-1 flex flex-col h-full bg-background',
            !mobileShowChat && 'hidden md:flex'
          )}
        >
          {/* Chat Header */}
          <div className="p-3.5 border-b flex items-center justify-between gap-3 bg-card">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8"
                onClick={() => setMobileShowChat(false)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-10 w-10 border border-emerald-500/30">
                <AvatarImage src={activeContact.avatar} alt={activeContact.name} />
                <AvatarFallback>{activeContact.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold truncate">{activeContact.name}</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ● En ligne
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {activeContact.courseTitle} •{' '}
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <Calendar className="h-3 w-3 inline" /> {activeContact.scheduleLabel}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`https://wa.me/${activeContact.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Bonjour ${activeContact.name}, je vous écris depuis 9arrini.me concernant "${activeContact.courseTitle}".`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-white px-3 py-1.5 text-xs font-bold transition shadow-xs"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">WhatsApp Direct</span>
              </a>
              <a
                href={`/service/${activeContact.courseSlug}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 text-xs font-semibold transition"
              >
                <Video className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Voir Séance</span>
              </a>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-slate-950/20">
            <div className="text-center my-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full">
                <Sparkles className="h-3 w-3 text-emerald-600" />
                Discussion directe sécurisée sur 9arrini.me
              </span>
            </div>

            {currentMessages.map(msg => (
              <div
                key={msg.id}
                className={cn('flex flex-col', msg.isMe ? 'items-end' : 'items-start')}
              >
                <div
                  className={cn(
                    'max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs',
                    msg.isMe
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-foreground rounded-bl-xs'
                  )}
                >
                  <p>{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-muted-foreground">
                  <span>{msg.senderName}</span>
                  <span>•</span>
                  <span>{msg.createdAt}</span>
                  {msg.isMe && <CheckCheck className="h-3 w-3 text-emerald-600" />}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 border-t bg-card flex items-center gap-2">
            <Input
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={`Écrire un message à ${activeContact.name}...`}
              className="flex-1 h-10 text-xs rounded-xl"
            />
            <Button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-4 rounded-xl text-xs font-semibold"
            >
              <Send className="h-4 w-4 mr-1.5" />
              Envoyer
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
