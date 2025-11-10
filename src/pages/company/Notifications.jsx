import React, { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function CompanyNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) return;
      setCompanyId(user.uid);

      try {
        const notifQuery = query(
          collection(db, "notifications"),
          where("companyId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
          notifQuery,
          (snapshot) => {
            const notifs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setNotifications(notifs);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching notifications:", error);
            toast.error("Failed to load notifications.");
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (err) {
        console.error("Error fetching notifications:", err);
        toast.error("Failed to load notifications.");
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
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

  if (loading)
    return (
      <p className="text-center mt-20 text-muted-foreground">
        Loading notifications...
      </p>
    );

  if (!notifications.length)
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
        <h1 className="text-2xl font-semibold mb-2">No notifications yet</h1>
        <p>Students haven't responded to interviews yet.</p>
      </div>
    );

  const groupedNotifications = notifications.reduce((acc, notif) => {
    acc[notif.type] = acc[notif.type] || [];
    acc[notif.type].push(notif);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-primary mb-4">Interview Responses</h1>

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
                      notif.read
                        ? "bg-card text-card-foreground"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">{notif.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm">{notif.message}</p>
                      <p className="text-xs text-slate-400">
                        {notif.createdAt?.toDate().toLocaleString() || ""}
                      </p>
                      {!notif.read && (
                        <Button
                          size="sm"
                          onClick={() => markAsRead(notif.id)}
                          className="bg-primary text-primary-foreground mt-2"
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
