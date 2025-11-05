import { useEffect, useState } from "react";
import api from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Institutions() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newInstitution, setNewInstitution] = useState({ name: "", address: "" });
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({ name: "", address: "" });

  // Fetch institutions
  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/institutions");
      setInstitutions(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch institutions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  // Add institution
  const addInstitution = async () => {
    if (!newInstitution.name || !newInstitution.address) return;
    try {
      const res = await api.post("/admin/institutions", newInstitution);
      setInstitutions([...institutions, { id: res.data.id, ...newInstitution }]);
      setNewInstitution({ name: "", address: "" });
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to add institution");
    }
  };

  // Update institution
  const updateInstitution = async (id) => {
    try {
      await api.put(`/admin/institutions/${id}`, editingData);
      setInstitutions(
        institutions.map((inst) => (inst.id === id ? { ...inst, ...editingData } : inst))
      );
      setEditingId(null);
      setEditingData({ name: "", address: "" });
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to update institution");
    }
  };

  // Delete institution
  const deleteInstitution = async (id) => {
    if (!confirm("Are you sure you want to delete this institution?")) return;
    try {
      await api.delete(`/admin/institutions/${id}`);
      setInstitutions(institutions.filter((inst) => inst.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to delete institution");
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-muted-foreground">Loading...</p>;

  if (error)
    return <p className="text-center mt-10 text-destructive">{error}</p>;

  return (
    <div className="p-6 bg-background min-h-screen space-y-6">
      {/* Add Institution Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Institution</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Institution Name"
            value={newInstitution.name}
            onChange={(e) =>
              setNewInstitution({ ...newInstitution, name: e.target.value })
            }
          />
          <Input
            placeholder="Address"
            value={newInstitution.address}
            onChange={(e) =>
              setNewInstitution({ ...newInstitution, address: e.target.value })
            }
          />
          <Button onClick={addInstitution} variant="default">
            Add
          </Button>
        </CardContent>
      </Card>

      {/* Institutions List */}
      <Card>
        <CardHeader>
          <CardTitle>Institutions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {institutions.length === 0 ? (
            <p className="text-muted-foreground">No institutions found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {institutions.map((inst) => (
                <Card key={inst.id} className="bg-card border border-border">
                  <CardContent>
                    {editingId === inst.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editingData.name}
                          onChange={(e) =>
                            setEditingData({ ...editingData, name: e.target.value })
                          }
                        />
                        <Input
                          value={editingData.address}
                          onChange={(e) =>
                            setEditingData({ ...editingData, address: e.target.value })
                          }
                        />
                        <div className="flex gap-2">
                          <Button onClick={() => updateInstitution(inst.id)} size="sm">
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingId(null)}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-foreground">{inst.name}</h3>
                        <p className="text-muted-foreground">{inst.address}</p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            onClick={() => {
                              setEditingId(inst.id);
                              setEditingData({
                                name: inst.name,
                                address: inst.address,
                              });
                            }}
                            size="sm"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => deleteInstitution(inst.id)}
                            variant="destructive"
                            size="sm"
                          >
                            Delete
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
