'use client';

import {useEffect, useState, useRef} from 'react';
import {
  getRealMessagingState,
  sendRealChatMessage,
  type RealChatContact,
} from '@/hooks/message/real-messages';
import type {CloudChatMessage} from '@/lib/cloud-store';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
import Link from 'next/link';
import {
  Send,
  Video,
  MessageCircle,
  Search,
  CheckCheck,
  Calendar,
  ArrowLeft,
  MessageSquare,
  Compass,
} from 'lucide-react';
import {cn} from '@/lib/utils';

export type User = {id: string; name: string; avatar?: string};
export type CurrentUser = {id: string; name: string; role: string; avatar?: string};
export type Booking = any;
export type Conversation = any;

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    role: string;
  } | null>(null);
  const [contacts, setContacts] = useState<RealChatContact[]>([]);
  const [activeContact, setActiveContact] = useState<RealChatContact | null>(null);
  const [messages, setMessages] = useState<CloudChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clear any old demo chat history from localStorage
    try {
      localStorage.removeItem('9arrini_chat_history_v1');
    } catch {
      // ignore
    }

    const init = async () => {
      setLoading(true);
      const params = new URLSearchParams(window.location.search);
      const qTutorId = params.get('tutorId');
      const qTutorName = params.get('tutorName');
      const qCourse = params.get('course');
      const qSlug = params.get('slug');

      const state = await getRealMessagingState({
        tutorId: qTutorId,
        tutorName: qTutorName,
        course: qCourse,
        slug: qSlug,
      });

      setCurrentUser(state.currentUser);
      setContacts(state.contacts);
      setMessages(state.messages);

      const initialTarget =
        (qTutorId && state.contacts.find(c => c.id === qTutorId)) || state.contacts[0] || null;
      setActiveContact(initialTarget);
      if (qTutorId && initialTarget) setMobileShowChat(true);
      setLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [activeContact, messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContact || !currentUser) return;

    const textToSend = inputText.trim();
    setInputText('');

    const optimisticMsg: CloudChatMessage = {
      id: `temp_${Date.now()}`,
      roomId: [currentUser.id, activeContact.id].sort().join('--'),
      senderId: currentUser.id,
      senderName: currentUser.name,
      recipientId: activeContact.id,
      recipientName: activeContact.name,
      text: textToSend,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMsg]);

    const res = await sendRealChatMessage({
      recipientId: activeContact.id,
      recipientName: activeContact.name,
      text: textToSend,
    });

    if (res.success && res.message) {
      setMessages(prev => prev.map(m => (m.id === optimisticMsg.id ? res.message! : m)));
    }
  };

  const filteredContacts = contacts.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getConversationMessages = (contactId: string) => {
    if (!currentUser) return [];
    const roomId = [currentUser.id, contactId].sort().join('--');
    return messages.filter(
      m =>
        m.roomId === roomId ||
        (m.senderId === currentUser.id && m.recipientId === contactId) ||
        (m.senderId === contactId && m.recipientId === currentUser.id)
    );
  };

  const currentMessages = activeContact ? getConversationMessages(activeContact.id) : [];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background border rounded-xl overflow-hidden m-2 sm:m-4 shadow-xs">
      {/* Left Sidebar: Real Contacts Only */}
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
              placeholder="Rechercher un professeur ou élève..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-lg bg-background"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y">
          {loading ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Chargement de vos discussions...
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-6 text-center space-y-3">
              <MessageSquare className="h-8 w-8 text-muted-foreground/50 mx-auto" />
              <p className="text-xs font-medium text-foreground">Aucune conversation active</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Réservez un cours ou cliquez sur &laquo; Message 9arrini &raquo; sur la fiche d&apos;un
                professeur pour démarrer une discussion.
              </p>
              <Button asChild size="sm" variant="outline" className="text-xs">
                <Link href="/explore">
                  <Compass className="h-3.5 w-3.5 mr-1.5" />
                  Parcourir les cours
                </Link>
              </Button>
            </div>
          ) : (
            filteredContacts.map(contact => {
              const roomMsgs = getConversationMessages(contact.id);
              const lastMsg = roomMsgs.slice(-1)[0];
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
                    isSelected &&
                      'bg-emerald-50/90 dark:bg-emerald-950/40 border-l-4 border-emerald-600'
                  )}
                >
                  <Avatar className="h-10 w-10 border border-emerald-500/20 shrink-0">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback>{contact.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold truncate">{contact.name}</p>
                      {lastMsg && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {new Date(lastMsg.createdAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 truncate">
                      {contact.specialty}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {lastMsg ? lastMsg.text : contact.courseTitle}
                    </p>
                  </div>
                </button>
              );
            })
          )}
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
                <h3 className="text-sm font-bold truncate">{activeContact.name}</h3>
                <p className="text-xs text-muted-foreground truncate">
                  {activeContact.courseTitle}
                  {activeContact.scheduleLabel && (
                    <>
                      {' '}
                      •{' '}
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <Calendar className="h-3 w-3 inline" /> {activeContact.scheduleLabel}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={
                  activeContact.phone
                    ? `https://wa.me/${activeContact.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Bonjour ${activeContact.name}, je vous écris depuis 9arrini.me concernant "${activeContact.courseTitle}".`
                      )}`
                    : `https://wa.me/?text=${encodeURIComponent(
                        `Bonjour ${activeContact.name}, je vous écris depuis 9arrini.me concernant "${activeContact.courseTitle}".`
                      )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-white px-3 py-1.5 text-xs font-bold transition shadow-xs"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
              {activeContact.courseSlug && (
                <Link
                  href={`/service/${activeContact.courseSlug}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 text-xs font-semibold transition"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Voir Cours</span>
                </Link>
              )}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-slate-950/20">
            {currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <MessageSquare className="h-10 w-10 mb-2 text-emerald-600/40" />
                <p className="text-sm font-medium text-foreground">
                  Démarrez votre discussion avec {activeContact.name}
                </p>
                <p className="text-xs mt-1 max-w-sm">
                  Envoyez un message ci-dessous ou contactez directement sur WhatsApp.
                </p>
              </div>
            ) : (
              currentMessages.map(msg => {
                const isMe = Boolean(currentUser && msg.senderId === currentUser.id);
                return (
                  <div
                    key={msg.id}
                    className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs',
                        isMe
                          ? 'bg-emerald-600 text-white rounded-br-xs'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-foreground rounded-bl-xs'
                      )}
                    >
                      <p>{msg.text}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-muted-foreground">
                      <span>{msg.senderName}</span>
                      <span>•</span>
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isMe && <CheckCheck className="h-3 w-3 text-emerald-600" />}
                    </div>
                  </div>
                );
              })
            )}
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
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground">
          <MessageSquare className="h-12 w-12 mb-3 text-emerald-600/30" />
          <h3 className="text-base font-bold text-foreground">Messagerie Directe 9arrini</h3>
          <p className="text-xs mt-1 max-w-sm">
            Sélectionnez un contact dans la liste ou réservez une séance sur la page Explorer pour discuter avec votre professeur.
          </p>
        </div>
      )}
    </div>
  );
}
