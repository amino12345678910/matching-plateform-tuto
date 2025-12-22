'use client';

import {useEffect, useState} from 'react';
import io from 'socket.io-client';
import {cn} from '@/lib/utils';
import {Inbox} from '@/components/messages/inbox';
import {getUserInfo} from '@/hooks/get-user-info';
import MessagesLoading from '@/components/messages/loader';
import {createAvatar} from '@dicebear/core';
import {adventurerNeutral} from '@dicebear/collection';
import {cloudinaryUrl} from '@/lib/cloudinary';
import {useRef} from 'react';
import {profilePhoto} from '@/components/profile-url';
import type {Message} from '@/types/messages';

export type User = {
  id: string;
  name: string;
  image?: string;
};

type Conversation = {
  id: string;
  otherUser: User;
  bookingId: string;
  lastMessage?: Message;
  createdAt: Date;
};

export default function MessagesPage() {
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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
      const {userId: id, name, image: imageUrl, imageSource} = await getUserInfo();
      if (!id || !name || !imageSource) return;
      const image = await profilePhoto({imageUrl, imageSource});
      const user = {id, name, image};
      // console.log('user ', user);
      setCurrentUser(user);

      s = io('http://localhost:9000', {
        auth: {userId: user.id},
      });

      setSocket(s);

      s.emit('get-conversations');

      s.on('conversations', setConversations);
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

  if (!currentUser) return;
  if (loading) return <MessagesLoading />;

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

          <div className="space-y-1 border-t">
            {[...conversations]

              .sort((a, b) => {
                const aTime = a.lastMessage?.createdAt
                  ? new Date(a.lastMessage.createdAt).getTime()
                  : a.createdAt.getTime();
                const bTime = b.lastMessage?.createdAt
                  ? new Date(b.lastMessage.createdAt).getTime()
                  : b.createdAt.getTime();
                return bTime - aTime;
              })
              .map(conv => {
                const userImage =
                  conv.otherUser.image && conv.otherUser.image.length > 0
                    ? conv.otherUser?.image
                    : null;

                const userName = conv.otherUser.name;

                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConv(conv);
                      setIsActiveConv(true);
                    }}
                    className={cn(
                      'w-full flex items-start gap-3 px-2 py-2 rounded-lg text-left transition',
                      'hover:bg-muted',
                      activeConv?.id === conv.id && 'bg-muted'
                    )}
                  >
                    <img
                      width={36}
                      height={36}
                      id="avatar-img"
                      onError={e => {
                        e.currentTarget.src = userImage!;
                      }}
                      src={
                        userImage
                          ? cloudinaryUrl(userImage, 'q_50,f_auto')
                          : createAvatar(adventurerNeutral, {seed: userName}).toDataUri()
                      }
                      alt={userName}
                      className="h-9 w-9 rounded-full object-cover shrink-0 pointer-events-none"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium leading-tight truncate">{userName}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage?.text ?? 'No messages yet'}
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
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
