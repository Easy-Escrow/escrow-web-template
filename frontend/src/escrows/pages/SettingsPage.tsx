import { FormEvent, useState } from 'react';

export function SettingsPage() {
  const [email, setEmail] = useState('ops@example.com');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    alert(`Settings saved for ${email}`);
  }

  return (
    <section>
      <h2>Workspace settings</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Notification email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <button type="submit">Save</button>
      </form>
    </section>
  );
}
