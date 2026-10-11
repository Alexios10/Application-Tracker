import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";
import { Collapse } from "@/components/Collapse";
import { Logo } from "@/components/Logo";
import { ApplicationStatus } from "@/types/application";
import { STATUSES, STATUS_DOT } from "@/constants/status";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const LoginPage = () => {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const title = isRegister
      ? "Registrer deg | Mine Søknader"
      : "Mine Søknader | Hold oversikt over jobbsøknader";
    const description = isRegister
      ? "Opprett konto i Mine Søknader for å samle og følge opp jobbsøknader og intervjuer på ett sted."
      : "Mine Søknader er en jobbsøknad-tracker som hjelper deg å organisere søknader, intervjuer og status i én enkel oversikt.";

    document.title = title;

    const updateMeta = (selector: string, content: string) => {
      const element = document.querySelector(selector);

      if (element) {
        element.setAttribute("content", content);
      }
    };

    updateMeta('meta[name="description"]', description);
    updateMeta('meta[property="og:title"]', title);
    updateMeta('meta[property="og:description"]', description);
    updateMeta('meta[name="twitter:title"]', title);
    updateMeta('meta[name="twitter:description"]', description);
  }, [isRegister]);

  // Already logged in? Go to the front page
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let result: string | null;

    if (isRegister) {
      result = await register(username, email, fullName, password);
    } else {
      result = await login(username, password, rememberMe);
    }

    if (result) {
      setError(result);
    } else {
      if (isRegister) {
        // Switch back to login after registration
        setIsRegister(false);
        setFullName("");
        setEmail("");
        setPassword("");
        navigate(`/login?username=${encodeURIComponent(username)}`);
      } else {
        navigate("/");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6">
        <Logo />
      </div>

      <main className="mx-auto grid w-full max-w-5xl gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1fr_400px] lg:items-start lg:gap-20 lg:pt-20">
        {/* Aligned to the top, so the text stays put when the form changes height */}
        <section className="lg:pt-10">
          <h1 className="max-w-[16ch] text-[34px] font-semibold leading-[1.1] tracking-tight sm:text-[44px]">
            Hold oversikt over jobbsøknadene dine
          </h1>
          <p className="mt-4 max-w-md text-[17px] leading-relaxed text-muted-foreground">
            Legg inn hver søknad du sender, og se med en gang hvor mange som
            venter på svar, hvor du skal på intervju og hvor det ble nei.
          </p>
          <ExampleOverview />
        </section>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border bg-card p-6 sm:p-8"
        >
          <h2 className="mb-5 text-xl font-semibold tracking-tight">
            {isRegister ? "Opprett konto" : "Logg inn"}
          </h2>

          {error && (
            <p
              role="alert"
              className="mb-5 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <Collapse open={isRegister}>
            <div className="space-y-5 pb-5">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Fullt navn</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  aria-describedby="email-hint"
                  required
                />
                <p id="email-hint" className="text-sm text-muted-foreground">
                  Brukes hvis du glemmer passordet, så sjekk at den er riktig.
                </p>
              </div>
            </div>
          </Collapse>

          <div className="mb-5 space-y-1.5">
            <Label htmlFor="username">Brukernavn</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="mb-1.5 block">
              Passord
            </Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? "new-password" : "current-password"}
              aria-describedby={isRegister ? "password-hint" : undefined}
              minLength={isRegister ? 8 : undefined}
              required
            />
            <Collapse open={isRegister}>
              <p
                id="password-hint"
                className="pt-1.5 text-sm text-muted-foreground"
              >
                Minst 8 tegn, med stor og liten bokstav og et tall.
              </p>
            </Collapse>
          </div>

          <Collapse open={!isRegister}>
            <div className="flex items-center justify-between pt-5">
              <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 accent-foreground"
                />
                Husk meg
              </label>
              <a
                href="/forgot-password"
                className="text-sm text-link underline-offset-4 hover:underline"
              >
                Glemt passord?
              </a>
            </div>
          </Collapse>

          <Button type="submit" disabled={loading} className="mt-5 w-full">
            {loading
              ? "Vent litt..."
              : isRegister
                ? "Opprett konto"
                : "Logg inn"}
          </Button>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {isRegister ? "Har du allerede en konto? " : "Ny her? "}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="font-medium text-link underline-offset-4 hover:underline"
            >
              {isRegister ? "Logg inn" : "Opprett konto"}
            </button>
          </p>
        </form>
      </main>

      {/* Pinned to the bottom of the screen, so it doesn't move when the form changes height */}
      <footer className="mx-auto mt-auto w-full max-w-5xl px-4 pb-8 sm:px-6">
        <PrivacyDialog />
      </footer>
    </div>
  );
};

// A static example of the status overview, so new visitors see what they get
const EXAMPLE_COUNTS: Record<ApplicationStatus, number> = {
  Sendt: 11,
  Intervju: 4,
  Tilbud: 1,
  Avslag: 6,
  Ghosted: 2,
};

function ExampleOverview() {
  const total = Object.values(EXAMPLE_COUNTS).reduce((a, b) => a + b, 0);
  return (
    <figure className="mt-12 hidden max-w-lg sm:block" aria-hidden="true">
      <div className="flex h-3 gap-[3px] overflow-hidden rounded-full">
        {STATUSES.map((status) => (
          <div
            key={status}
            className={STATUS_DOT[status]}
            style={{ width: `${(EXAMPLE_COUNTS[status] / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
        {STATUSES.map((status) => (
          <span key={status} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
            {status}
            <span className="tabular font-semibold">
              {EXAMPLE_COUNTS[status]}
            </span>
          </span>
        ))}
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        Slik kan det se ut etter seks uker og {total} søknader.
      </figcaption>
    </figure>
  );
}

function PrivacyDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <Shield className="h-3.5 w-3.5" />
          Personvern og rettigheter
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Personvern og rettigheter</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm leading-relaxed">
          <section>
            <h3 className="mb-1 font-semibold">Datainnsamling</h3>
            <p>
              Vi lagrer kun informasjon du oppgir ved registrering (brukernavn,
              e-postadresse og fullt navn) samt jobbsøknadene du registrerer. Vi
              samler ikke inn data fra tredjeparter.
            </p>
          </section>
          <section>
            <h3 className="mb-1 font-semibold">Bruk av data</h3>
            <p>
              Dataene brukes utelukkende for å gi deg oversikt over dine
              jobbsøknader. Vi selger eller deler aldri dine opplysninger med
              andre.
            </p>
          </section>
          <section>
            <h3 className="mb-1 font-semibold">Lagring og sikkerhet</h3>
            <p>
              Passord lagres kryptert. All kommunikasjon mellom nettleseren din
              og serveren skjer over HTTPS.
            </p>
          </section>
          <section>
            <h3 className="mb-1 font-semibold">Dine rettigheter</h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Du kan når som helst be om innsyn i dataene vi lagrer om deg.
              </li>
              <li>Du kan be om at dataene dine blir slettet.</li>
              <li>Du kan oppdatere eller korrigere opplysningene dine.</li>
            </ul>
          </section>
          <section>
            <h3 className="mb-1 font-semibold">Kontakt</h3>
            <p>
              Har du spørsmål om personvern? Ta kontakt på{" "}
              <a
                href="mailto:minesoknader@gmail.com"
                className="text-link underline-offset-4 hover:underline"
              >
                minesoknader@gmail.com
              </a>
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LoginPage;
