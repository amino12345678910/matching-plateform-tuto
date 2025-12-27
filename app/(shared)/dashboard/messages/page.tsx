'use client';

import MessagesList from '@/components/messages/messages-list';
import MessagesLoading from '@/components/messages/loader';
import {getUserInfo} from '@/hooks/shared/get-user-info';
import {profilePhoto} from '@/components/profile-url';
import type {imageSources} from '@/generated/prisma';
import {Inbox} from '@/components/messages/inbox';
import type {Message} from '@/types/messages';
import {useEffect, useState} from 'react';
import io from 'socket.io-client';
import {cn} from '@/lib/utils';
import {useRef} from 'react';
import MessagesEmptyState from '@/components/messages/empty-state';

export type User = {
  id: string;
  name: string;
  image?: string;
  avatar: string;
  imageSource: string | imageSources;
};

export type Conversation = {
  avatar(arg0: string, avatar: any): unknown;
  id: string;
  otherUser: User;
  bookingId: string;
  lastMessage?: Message;
  createdAt: Date;
};

export default function MessagesPage() {
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    role: 'SELLER' | 'USER';
  } | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isActiveConv, setIsActiveConv] = useState(false);
  const activeRoomIdRef = useRef<string | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    activeRoomIdRef.current = activeConv?.id ?? null;
  }, [activeConv?.id]);

  useEffect(() => {
    let s: SocketIOClient.Socket;

    const init = async () => {
      const user = await getUserInfo();
      if (!user.userId || !user.role) return;
      setCurrentUser({id: user.userId, role: user.role as 'SELLER' | 'USER'});

      s = io('http://localhost:9000', {
        auth: {userId: user.userId},
      });

      setSocket(s);

      s.emit('get-conversations');

      s.on('conversations', (convs: Conversation[]) => {
        const resolve = async () => {
          const enrichedLocal = await Promise.all(
            convs.map(async conv => ({
              ...conv,
              otherUser: {
                ...conv.otherUser,
                avatar: await profilePhoto({
                  imageUrl: conv.otherUser.image,
                  imageSource: conv.otherUser.imageSource,
                  email: conv.otherUser.name,
                }),
              },
            }))
          );
          setConversations(enrichedLocal);
        };
        resolve();
      });
      s.on('receive-message', (msg: Message) => {
        if (msg.roomId !== activeRoomIdRef.current) return console.error('Sussy Chat');
        setMessages(prev => [...prev, msg]);
      });
    };

    init();

    setLoading(false);
    return () => {
      s?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !activeConv) return;
    const roomId = activeConv.id;

    setMessages([]);
    socket.emit('join-room', roomId);
    socket.emit('get-messages', {
      roomId,
      userId: currentUser?.id,
      bookingId: activeConv.bookingId,
    });

    socket.on('messages', setMessages);

    const handleMessages = (msgs: Message[]) => {
      setMessages(msgs);
    };

    socket.on('messages', handleMessages);

    return () => {
      socket.emit('leave-room', roomId);
      socket.off('messages', handleMessages);
    };
  }, [activeConv, socket]);

  const sendMessage = (text: string, cloudinaryFileUrls: string[]) => {
    if (!socket || !activeConv) return;

    socket.emit('send-message', {
      roomId: activeConv.id,
      cloudinaryFileUrls,
      text,
    });
  };

  if (!currentUser || loading) return <MessagesLoading />;
  if (!loading && !conversations[0]) return <MessagesEmptyState role={currentUser.role} />;
  else
    return (
      <>
        <title>Messages | Five Services</title>
        <meta name="description" content="Start Conversation with your client" />

        <div className="flex h-[80vh] border rounded-xl overflow-hidden">
          <aside
            className={cn(
              'border-r bg-background transition-all',
              'w-full lg:w-72',
              isActiveConv && 'hidden lg:block'
            )}
          >
            <h2 className="text-xl  font-semibold mx-2 my-3 p-1">Inbox</h2>
            <MessagesList
              activeConv={activeConv}
              enriched={conversations}
              onView={(conv, isActive) => {
                setActiveConv(conv);
                setIsActiveConv(isActive);
              }}
            />
          </aside>

          {activeConv ? (
            <Inbox
              messages={messages}
              currentUserId={currentUser.id}
              onSend={async (text, cloudinaryFileUrls) => {
                console.log('page cloudinaryFileUrls', cloudinaryFileUrls);

                sendMessage(text, cloudinaryFileUrls);
              }}
              user={activeConv.otherUser}
              isActiveConv={isActiveConv}
              onBack={() => setIsActiveConv(prev => !prev)}
            />
          ) : (
            <div className="hidden flex-1 lg:flex items-center justify-center text-muted-foreground">
              Select a conversation
            </div>
          )}
        </div>
      </>
    );
}
