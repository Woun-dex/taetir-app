import React, { useState } from "react";
import { Plus } from "lucide-react";

const mentors = [
  { id: 1, name: "YOUSSEF", availability: "available" },
  { id: 2, name: "MOHAMED", availability: "busy" },
  { id: 3, name: "WALID", availability: "available" },
];

const NewSessionButton = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const availableMentors = mentors.filter(
    (mentor) => mentor.availability === "available"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMentor && selectedDate && selectedTime) {
      alert(
        `Session créée avec :\nMentor ID: ${selectedMentor}\nDate: ${selectedDate}\nHeure: ${selectedTime}`
      );
      // Réinitialiser le formulaire
      setShowForm(false);
      setSelectedMentor("");
      setSelectedDate("");
      setSelectedTime("");
    } else {
      alert("Veuillez remplir tous les champs.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        <Plus size={18} />
        <span>New Session</span>
      </button>

      {/* Formulaire */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl shadow p-4 space-y-4 w-full max-w-md"
        >
          <h2 className="text-lg font-semibold text-gray-800">
            Créer une session
          </h2>

          {/* Choix mentor */}
          <div className="flex flex-col">
            <label
              htmlFor="mentor"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Choisir un mentor actif :
            </label>
            <select
              id="mentor"
              value={selectedMentor}
              onChange={(e) => setSelectedMentor(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Sélectionner un mentor --</option>
              {availableMentors.map((mentor) => (
                <option key={mentor.id} value={mentor.id}>
                  {mentor.name}
                </option>
              ))}
            </select>
          </div>

          {/* Choix date */}
          <div className="flex flex-col">
            <label
              htmlFor="date"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Choisir une date :
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Choix heure */}
          <div className="flex flex-col">
            <label
              htmlFor="time"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Choisir une heure :
            </label>
            <input
              type="time"
              id="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Bouton de confirmation */}
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Confirmer
          </button>
        </form>
      )}
    </div>
  );
};

export default NewSessionButton;