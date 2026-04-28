import { useState } from "react";

type Contact = { name: string; phone: string };

export function ContactControl({
  onNext,
  initialContacts
}: {
  onNext: (contacts: Contact[]) => void;
  initialContacts: Contact[];
}) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleAdd = () => {
    if (name.trim() && phone.trim() && contacts.length < 5) {
      setContacts([...contacts, { name: name.trim(), phone: phone.trim() }]);
      setName("");
      setPhone("");
    }
  };

  const handleDelete = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    if (contacts.length > 0) {
      onNext(contacts);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tight leading-tight uppercase">
          WHO CAN THE COMPANION REACH?
        </h1>

        <p className="text-lg text-gray-700 max-w-lg">
          Only approved contacts can be called or notified. You stay in control.
        </p>
      </div>

      <div className="space-y-6 pt-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#E85D2A] focus:outline-none bg-white transition-colors"
          />
          <input
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#E85D2A] focus:outline-none bg-white transition-colors"
          />
          <button
            onClick={handleAdd}
            disabled={!name.trim() || !phone.trim() || contacts.length >= 5}
            className="px-6 py-3 bg-white border-2 border-[#E85D2A] text-[#E85D2A] rounded-xl hover:bg-[#E85D2A] hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
          >
            + Add
          </button>
        </div>

        {contacts.length >= 5 && (
          <p className="text-sm text-gray-500">Maximum 5 contacts allowed</p>
        )}

        {contacts.length > 0 && (
          <div className="space-y-3 pt-4">
            {contacts.map((contact, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white px-5 py-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{contact.name}</p>
                  <p className="text-sm text-gray-600">{contact.phone}</p>
                </div>
                <button
                  onClick={() => handleDelete(index)}
                  className="text-red-500 hover:text-red-700 transition-colors p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={contacts.length === 0}
          className="mt-8 bg-[#E9C46A] px-8 py-4 rounded-xl border border-[#d4b25f] shadow-sm hover:bg-[#dbb860] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none font-semibold"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
