<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Marketing sections live in src/components/sections.tsx and are composed by routes; reuse them instead of duplicating page markup — keeps pages consistent.
- Unconfirmed business contact/store details stay null in src/lib/site.ts and render as "To be announced"/"Coming soon" — never invent real-world details.
