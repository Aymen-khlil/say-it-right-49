# What To Say

Build a simple AI writing assistant called "What Do I Say?"

The purpose is to help normal people figure out how to phrase awkward messages.

Main page

Header:

What Do I Say?

Subtitle:

"Tell me what you want to say. I'll help you say it."

Create a large textarea with placeholder:

"I need to tell my boss I can't come tomorrow."

Add style options:

Professional

Friendly

Polite

Short

Casual

Add a large button:

✨ Write It For Me

Result

Display:

Your message

Then generate a polished message based on the user's situation and selected style.

Example:

"Hi Sarah, unfortunately I'm not feeling well and won't be able to come in tomorrow. I'll keep you updated. Thanks for understanding."

Add buttons:

Copy
Try another version
Make it shorter
Make it friendlier

AI

Use an LLM API to generate the response.

The AI should preserve the user's intended meaning and should not invent important facts.

If AI is not configured, provide a mock response so the interface can still be tested.

UX

Keep the application extremely simple.

No authentication, database, dashboard, or unnecessary pages.

Make the generated message easy to copy on mobile.

Use a clean modern interface with subtle animations and excellent typography.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/12bb339e-7803-44c9-a037-cb4e00b64e02).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
