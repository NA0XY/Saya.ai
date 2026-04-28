import { useState } from "react";

type Contact = { name: string; phone: string };

type GuardianContactHubProps = {
  initialContacts: Contact[];
  onSave: (contacts: Contact[]) => Promise<void>;
};

export function GuardianContactHub({ initialContacts, onSave }: GuardianContactHubProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const handleAdd = () => {
    if (name.trim() && phone.trim() && contacts.length < 5) {
      setContacts([...contacts, { name: name.trim(), phone: phone.trim() }]);
      setName("");
      setPhone("");
      setSaveStatus("idle");
    }
  };

  const handleDelete = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
    setSaveStatus("idle");
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      await onSave(contacts);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim() && phone.trim()) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white sketch-box text-[#D94F2B] flex items-center justify-center text-xl shadow-sm">
            📞
          </div>
          <div>
            <h3 className="text-xl font-sketch font-bold text-[#D94F2B] relative -top-1.5">Guardian Contact Hub</h3>
            <p className="text-[10px] text-[#83311A]/60 font-sketch font-medium uppercase tracking-wider">
              Only approved contacts can be notified
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            alert("Live Demo Triggered: Calling primary contact...");
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-transparent text-[#D94F2B] sketch-box font-sketch font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all"
        >
          <div className="w-2 h-2 sketch-dot bg-[#D94F2B] animate-pulse" />
          Test Connection
        </button>
      </div>

      {/* Add Contact Form */}
      <div className="bg-white sketch-box p-5 text-[#D94F2B]" style={{ transform: 'rotate(-0.3deg)' }}>
        <div className="relative mb-4">
          <label className="inline-block text-xs font-sketch font-bold uppercase tracking-widest text-[#83311A]/70">
            Add New Member
          </label>
          <div className="absolute -bottom-1 left-0 w-16 sketch-underline border-[#D94F2B]"></div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 sketch-box text-[#D94F2B]">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Contact name"
              className="w-full px-3 py-2 bg-transparent focus:outline-none font-sketch font-bold text-base placeholder-[#D94F2B]"
            />
          </div>
          <div className="flex-1 sketch-box text-[#D94F2B]">
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Contact phone number"
              className="w-full px-3 py-2 bg-transparent focus:outline-none font-sketch font-bold text-base placeholder-[#D94F2B]"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!name.trim() || !phone.trim() || contacts.length >= 5}
            aria-label="Add contact"
            className="px-6 py-2 bg-transparent text-[#D94F2B] sketch-box hover:rotate-[-0.5deg] hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-sketch font-bold text-base uppercase tracking-wider"
            style={{ transform: 'rotate(0.5deg)' }}
          >
            + Add
          </button>
        </div>
        {contacts.length >= 5 && (
          <p className="text-xs font-sketch text-[#83311A]/60 mt-2 italic">Maximum 5 contacts allowed</p>
        )}
      </div>

      {/* SMS Alerts Toggle */}
      <div className="flex items-center justify-between bg-white px-5 py-4 sketch-box text-[#D94F2B]" style={{ transform: 'rotate(0.4deg)' }}>
        <div>
          <h4 className="font-sketch font-bold text-[#D94F2B] text-base uppercase">Critical SMS Alerts</h4>
          <p className="text-xs text-[#83311A]/60 font-sketch font-medium">Notify guardians immediately during health emergencies</p>
        </div>
        <button
          onClick={() => setSmsAlertsEnabled(!smsAlertsEnabled)}
          className={`w-12 h-6 sketch-toggle-track transition-colors relative ${smsAlertsEnabled ? "bg-[#D94F2B]" : "bg-gray-200"}`}
          aria-pressed={smsAlertsEnabled}
          aria-label="Toggle SMS Alerts"
        >
          <div className={`w-4 h-4 bg-white sketch-toggle-thumb absolute top-1 transition-transform ${smsAlertsEnabled ? "translate-x-7" : "translate-x-1"}`} />
        </button>
      </div>

      {/* Contact List */}
      {contacts.length > 0 ? (
        <div className="space-y-3">
          {contacts.map((contact, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white px-5 py-4 sketch-box text-[#D94F2B] sketch-shadow hover:scale-[1.01] transition-all group"
              style={{ transform: `rotate(${index % 2 === 0 ? -0.4 : 0.4}deg)` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#D94F2B]/10 sketch-avatar flex items-center justify-center text-lg font-sketch font-bold text-[#D94F2B]">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-sketch font-bold text-[#D94F2B] text-lg">{contact.name}</p>
                  <p className="text-sm text-[#83311A]/60 font-sketch">{contact.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  aria-label={`Edit ${contact.name}`}
                  className="text-[#83311A]/40 hover:text-[#D94F2B] transition-colors p-1.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  aria-label={`Remove ${contact.name}`}
                  className="text-red-400 hover:text-red-600 transition-colors p-1.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white sketch-box p-8 border-dashed border-[#D94F2B]/30 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-[#F5F1EA] sketch-avatar flex items-center justify-center text-3xl shadow-sm mb-4">
            🤖
          </div>
          <h4 className="text-[#D94F2B] font-sketch font-bold text-xl mb-1">I need someone to call in emergencies</h4>
          <p className="text-[#83311A]/60 font-sketch text-base max-w-sm">
            Add family members or primary caregivers who should be notified when health vitals drop.
          </p>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-8 p-6 bg-white sketch-box text-[#D94F2B] flex flex-col sm:flex-row items-center justify-between gap-4 sketch-shadow" style={{ transform: 'rotate(-0.2deg)' }}>
        <div className="text-base font-sketch font-bold">
          {saveStatus === "success" && (
            <span className="text-green-600 flex items-center gap-2">✓ Saved!</span>
          )}
          {saveStatus === "error" && (
            <span className="text-red-500">Oops! Try again.</span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || contacts.length === 0}
          className="w-full sm:w-auto px-8 py-3 bg-[#D94F2B] text-white sketch-box font-sketch font-bold uppercase tracking-widest text-sm hover:rotate-[0.5deg] hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          style={{ transform: 'rotate(-0.5deg)' }}
        >
          {isSaving ? "Sketching..." : "Save Contacts"}
        </button>
      </div>
    </div>
  );
}