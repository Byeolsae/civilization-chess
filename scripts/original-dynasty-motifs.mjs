// Newly drawn emblems: no reference contour data is used for these three designs.
// Keep the reduced footprint and the existing two-side palette system.
const emblem = body => `<g transform="translate(4.8 4.8) scale(.544)" fill="var(--main)">${body}</g>`;
const wing = `<path d="M48 42C39 38 33 26 25 26C22 26 20 29 19 33C16 37 10 39 4 39C7 43 14 44 21 40C17 46 10 48 5 47C11 53 21 50 27 44C24 51 17 55 12 55C20 59 29 52 32 48C31 54 27 58 24 60C33 60 38 52 39 49C39 55 37 59 35 61C43 58 49 50 48 42Z"/>`;
export const originalDynastyMotifs = {
 ming:emblem(`${wing}<g transform="translate(100 0) scale(-1 1)">${wing}</g>
 <path d="M43 47C41 40 43 35 49 29C54 24 54 21 50 19C44 20 38 18 36 13C41 15 45 15 48 13C43 12 41 8 42 5C47 10 52 10 56 12C60 10 65 12 67 16L75 19L67 21L71 24L64 23C58 27 60 32 58 38C56 43 54 47 53 53Z"/>
 <path d="M44 49C36 57 39 67 28 73C22 76 17 75 14 74C22 83 38 75 41 62C37 77 34 86 23 87C38 92 45 72 46 60C44 77 46 91 36 96C52 93 52 71 50 58C54 74 60 88 50 97C67 91 59 69 54 57C64 70 72 81 65 90C80 83 67 64 57 54C71 64 83 64 84 77C90 63 72 56 58 49Z"/>
 <g fill="none" stroke="var(--base)" stroke-width="1.5" stroke-linecap="round"><path d="M25 33C30 33 34 37 37 41M75 33C70 33 66 37 63 41M51 30C48 34 47 39 49 43"/></g><path d="M59 15L63 17L59 18Z" fill="var(--base)"/>`),
 goryeo:emblem(`<path d="M32 22C28 18 21 18 18 23L9 28L19 27L13 31L24 28C30 29 29 33 24 40C17 49 18 59 26 65C34 72 46 72 56 67C64 73 77 76 88 73C79 71 75 67 72 63C80 67 88 66 93 62C84 63 77 59 73 55C83 57 91 53 94 48C85 52 76 48 71 45C81 42 86 37 88 31C81 36 75 37 69 38C76 32 79 23 77 16C73 26 66 29 61 31C68 22 68 13 64 7C64 18 57 24 52 28C55 20 53 12 49 9C51 21 44 27 43 37C42 45 39 49 35 48C29 45 33 39 36 34C39 28 37 24 32 22Z"/>
 <path d="M24 20C23 12 28 9 33 10C38 11 41 15 43 18C39 17 36 15 33 15C28 14 26 17 27 21Z"/>
 <g fill="none" stroke="var(--base)" stroke-width="1.6" stroke-linecap="round"><path d="M54 36C47 46 51 57 62 61M61 38C57 47 63 53 72 56M68 40C69 45 74 48 80 48M25 48C22 54 25 59 29 61"/></g>
 <g fill="none" stroke="var(--main)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M30 67L28 79L20 85M28 79L33 85M28 79L26 88M43 70L44 84L39 91M44 84L50 90M44 84L45 94M56 66L63 78L61 87M63 78L71 84M63 78L69 89"/></g>
 <path d="M22 23Q25 21 28 24L24 25Z" fill="var(--base)"/>`),
 han:emblem(`<path d="M34 24C25 26 20 32 19 38C23 35 26 34 29 34C20 40 15 47 14 54C18 50 23 48 27 47C17 57 14 67 16 74C19 69 23 66 27 64C21 74 22 83 26 90C38 83 49 86 64 94C62 80 54 68 55 57C60 61 65 63 71 61C75 60 78 57 80 54C85 53 89 50 89 46L92 42C94 39 92 35 89 34L79 28C76 26 74 21 71 18C65 12 57 11 50 14L42 4C39 9 40 15 41 20L34 13C32 16 33 21 34 24Z"/>
 <path d="M44 10L46 20L49 17Z" fill="var(--base)"/>
 <g fill="none" stroke="var(--base)" stroke-linecap="round"><path d="M36 29C28 35 27 42 24 46M36 41C27 51 26 60 23 65M38 54C31 66 31 76 29 81" stroke-width="1.7"/><path d="M48 36C43 50 47 68 55 81M62 21C68 24 69 29 74 32M69 49Q77 51 84 48" stroke-width="1.4"/></g>
 <path d="M55 29Q60 25 65 28L59 32Z" fill="var(--base)"/><path d="M83 38C80 36 78 39 80 42C83 43 85 40 83 38Z" fill="var(--base)"/>`)
};
