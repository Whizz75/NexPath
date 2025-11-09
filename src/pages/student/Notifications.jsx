// src/pages/student/Notifications.jsx
import React, { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      setUserId(user.uid);

      try {
        const q = query(
          collection(db, "notifications"),
          where("studentId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const notifs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setNotifications(notifs);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        toast.error("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (notifId) => {
    try {
      await updateDoc(doc(db, "notifications", notifId), { read: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error marking as read:", err);
      toast.error("Failed to mark notification as read.");
    }
  };

  // Group notifications by type
  const groupedNotifications = notifications.reduce((acc, notif) => {
    acc[notif.type] = acc[notif.type] || [];
    acc[notif.type].push(notif);
    return acc;
  }, {});

  if (loading) return <p className="text-center mt-20 text-muted-foreground">Loading notifications...</p>;

  if (!notifications.length)
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
        <h1 className="text-2xl font-semibold mb-2">No notifications yet</h1>
        <p>Stay tuned for admission and job updates!</p>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-primary mb-4">Your Notifications</h1>
      {Object.entries(groupedNotifications).map(([type, notifs]) => (
        <div key={type}>
          <h2 className="text-xl font-semibold mb-2 capitalize">{type} Notifications</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <AnimatePresence mode="wait">
              {notifs.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className={`p-4 border ${
                      notif.read ? "bg-card text-card-foreground" : "bg-primary/10 text-primary"
                    }`}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">{notif.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-2">{notif.message}</p>
                      {!notif.read && (
                        <Button
                          size="sm"
                          onClick={() => markAsRead(notif.id)}
                          className="bg-primary text-primary-foreground"
                        >
                          Mark as Read
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}
