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
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#E85D2A] to-[#ff8a5c] rounded-xl flex items-center justify-center text-xl shadow-md">
            📞
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#83311A]">Guardian Contact Hub</h3>
            <p className="text-sm text-[#83311A]/60 font-medium">
              Only approved contacts can be called or notified
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            alert("Live Exotel Demo Triggered: Calling primary contact...");
          }}
          className="flex items-center gap-2 px-4 py-2 mt-4 sm:mt-0 bg-[#E85D2A]/10 text-[#E85D2A] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#E85D2A]/20 transition-all border border-[#E85D2A]/20"
        >
          <div className="w-2 h-2 rounded-full bg-[#E85D2A] animate-pulse" />
          Test Connection
        </button>
      </div>

      {/* Add Contact Form */}
      <div className="bg-[#F5F1EA]/60 rounded-2xl p-5 border border-[#83311A]/10">
        <label className="block text-xs font-bold uppercase tracking-widest text-[#83311A]/70 mb-3">
          Add New Member
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Contact name"
            className="flex-1 px-4 py-3 rounded-xl border-2 border-[#83311A]/10 focus:border-[#E85D2A] focus:outline-none bg-white transition-colors text-base font-medium placeholder-gray-400"
          />
          <input
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Contact phone number"
            className="flex-1 px-4 py-3 rounded-xl border-2 border-[#83311A]/10 focus:border-[#E85D2A] focus:outline-none bg-white transition-colors text-base font-medium placeholder-gray-400"
          />
          <button
            onClick={handleAdd}
            disabled={!name.trim() || !phone.trim() || contacts.length >= 5}
            aria-label="Add contact"
            className="px-5 py-3 bg-white border-2 border-[#E85D2A] text-[#E85D2A] rounded-xl hover:bg-[#E85D2A] hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm uppercase tracking-wider"
          >
            + Add
          </button>
        </div>
        {contacts.length >= 5 && (
          <p className="text-xs text-[#83311A]/60 mt-2 font-medium">Maximum 5 contacts allowed</p>
        )}
      </div>

      {/* SMS Alerts Toggle */}
      <div className="flex items-center justify-between bg-white px-5 py-4 rounded-xl border border-[#83311A]/10 shadow-sm">
        <div>
          <h4 className="font-bold text-[#83311A] text-sm">Critical SMS Alerts</h4>
          <p className="text-xs text-[#83311A]/60 font-medium">Notify guardians immediately during health emergencies</p>
        </div>
        <button
          onClick={() => setSmsAlertsEnabled(!smsAlertsEnabled)}
          className={`w-12 h-6 rounded-full transition-colors relative ${smsAlertsEnabled ? "bg-[#E85D2A]" : "bg-gray-300"}`}
          aria-pressed={smsAlertsEnabled}
          aria-label="Toggle SMS Alerts"
        >
          <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${smsAlertsEnabled ? "translate-x-7" : "translate-x-1"}`} />
        </button>
      </div>

      {/* Contact List */}
      {contacts.length > 0 ? (
        <div className="space-y-3">
          {contacts.map((contact, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white px-5 py-4 rounded-xl border border-[#83311A]/10 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#E85D2A]/10 to-[#E85D2A]/5 rounded-full flex items-center justify-center text-lg font-bold text-[#E85D2A]">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-[#83311A] text-base">{contact.name}</p>
                  <p className="text-sm text-[#83311A]/60 font-medium">{contact.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  aria-label={`Edit ${contact.name}`}
                  className="text-[#83311A]/40 hover:text-[#E85D2A] transition-colors p-2 rounded-lg hover:bg-[#E85D2A]/5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  aria-label={`Remove ${contact.name}`}
                  className="text-red-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-10 border border-dashed border-[#83311A]/20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#E9C46A] to-[#f4d58d] rounded-full flex items-center justify-center text-3xl shadow-sm mb-4">
            🤖
          </div>
          <h4 className="text-[#83311A] font-bold text-lg mb-1">I need someone to call in emergencies</h4>
          <p className="text-[#83311A]/60 font-medium text-sm max-w-sm">
            Add family members or primary caregivers who should be notified when health vitals drop or assistance is needed.
          </p>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-8 p-6 bg-white rounded-2xl border border-[#83311A]/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="text-sm font-medium">
          {saveStatus === "success" && (
            <span className="text-green-600 flex items-center gap-2 font-bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              Contacts saved successfully
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-red-500 font-bold">Save failed — please try again</span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || contacts.length === 0}
          className="w-full sm:w-auto px-8 py-4 bg-[#E85D2A] text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-[#83311A] transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            "Save Contacts"
          )}
        </button>
      </div>
    </div>
  );
}
