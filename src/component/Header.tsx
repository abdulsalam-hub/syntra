const Header = () => (
  <header className="mb-8 text-center">
    <a href="/" className="inline-block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
      <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
        Syntra Translator
      </span>
    </a>
    <p className="mt-3 text-base text-slate-300 sm:text-lg">
      Understand more. Connect without language barriers.
    </p>
    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
      Translate text between languages, use your voice to enter text, and listen to translated results.
    </p>
  </header>
);

export default Header;
