// Original heraldic silhouettes. Curved feather masses and restrained negative-space detail.
export const dynastyEmblems = {ming:'vermilion-bird',goryeo:'three-legged-crow',yuan:'flame-sun-crescent',song:'crane',han:'heavenly-horse'};
const motif = body => `<g transform="scale(.64)" fill="var(--main)">${body}</g>`;
const featherWing = `<path d="M48 43C38 38 34 24 27 27C22 31 25 39 6 42C12 46 22 43 27 39C21 46 13 49 3 48C9 55 22 51 30 44C23 54 15 57 7 55C15 62 28 54 34 48C29 57 24 61 18 62C29 65 36 56 40 51C38 58 36 61 32 64C42 62 49 54 48 43Z"/>`;
export const dynastyMotifs = {
 ming:motif(`${featherWing}<g transform="translate(100 0) scale(-1 1)">${featherWing}</g>
 <path d="M44 52C39 44 42 36 48 29C51 25 49 22 46 20C39 22 33 17 33 9C37 15 42 16 46 14C42 13 41 9 42 6C45 12 51 11 56 13C62 12 67 15 68 19L77 22L68 24L73 27L64 26C57 30 60 38 57 46L53 57Z"/>
 <path d="M45 51C35 58 39 72 19 72C31 77 40 69 42 61C37 75 32 86 15 82C29 91 42 80 45 65C41 83 41 95 27 94C45 100 49 78 49 61C51 80 59 92 47 98C66 95 57 72 53 60C61 73 73 83 65 94C82 86 64 66 56 56C65 66 83 67 80 82C89 69 70 58 57 51Z"/>
 <g fill="none" stroke="var(--base)" stroke-width="1.3" stroke-linecap="round"><path d="M28 34C32 35 36 39 40 43M72 34C68 35 64 39 60 43M49 30C46 36 46 42 49 46"/></g><path d="M59 18L64 19L60 21Z" fill="var(--base)"/>`),
 goryeo:motif(`<path d="M32 25C26 21 19 21 16 27L7 32L18 31L12 36L23 32C31 33 27 39 21 46C14 55 17 66 28 70C36 75 48 73 59 69C67 75 80 80 92 77C83 75 78 69 75 66C84 69 91 67 95 64C85 64 79 60 75 56C86 57 92 54 95 49C86 52 78 49 73 46C82 42 87 38 88 32C82 36 77 38 72 38C80 30 83 21 80 17C76 25 70 29 65 31C72 22 74 13 69 7C69 17 62 23 57 27C61 17 60 10 55 7C56 20 46 26 45 39C45 48 41 54 35 52C28 49 31 42 35 36C39 31 38 27 32 25Z"/>
 <path d="M24 24C21 14 34 9 42 18C47 24 54 23 54 16C54 12 50 11 48 14" fill="none" stroke="var(--main)" stroke-width="3" stroke-linecap="round"/>
 <path d="M80 61C100 62 99 44 91 45C85 46 88 53 92 50" fill="none" stroke="var(--main)" stroke-width="3" stroke-linecap="round"/>
 <g fill="none" stroke="var(--base)" stroke-width="1.35" stroke-linecap="round"><path d="M53 37C48 52 54 62 66 65M59 40C56 49 62 56 72 60M65 40C65 47 71 51 79 52M25 51C21 58 25 63 30 64"/></g>
 <g fill="none" stroke="var(--main)" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M32 71L29 82L21 88M29 82L34 88M29 82L26 91M45 73L46 85L41 93M46 85L52 91M46 85L47 95M59 70L65 81L63 90M65 81L73 87M65 81L70 92"/></g><path d="M21 27Q25 25 27 28L23 29Z" fill="var(--base)"/>`),
 yuan:motif(`<path d="M50 3C46 11 51 14 47 20C44 18 43 15 45 11C38 18 40 27 48 29C56 31 63 24 59 17C57 14 56 11 57 8C51 12 58 18 53 21C49 16 56 12 50 3Z"/><circle cx="50" cy="52" r="20"/><path d="M15 62C22 82 43 91 62 84C74 80 82 72 85 62C84 82 69 96 50 96C31 96 16 82 15 62Z"/>`),
 song:motif(`<path d="M47 61C34 53 21 36 18 10C25 18 31 27 34 35C30 22 30 16 32 10C36 25 43 36 47 47C42 29 45 20 54 19C61 19 65 23 64 28L84 32L63 33C58 31 55 33 56 39C60 48 58 55 56 58C69 47 72 26 88 18C85 33 80 44 73 52C82 46 87 41 92 35C88 49 77 62 64 65L78 71C66 75 59 70 54 70C47 74 39 71 36 65Z"/>
 <path d="M22 24C28 40 36 53 44 59M30 25C35 44 41 50 46 55M39 36C42 47 46 52 49 55M80 33C73 50 67 58 59 62M82 43C73 58 68 62 62 65M52 34C49 38 52 47 51 52" fill="none" stroke="var(--base)" stroke-width="1.4" stroke-linecap="round"/>
 <path d="M46 70L43 91L33 94M43 91L47 95M54 70L58 83L68 87L64 91" fill="none" stroke="var(--main)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M49 25C51 20 56 20 60 23" stroke="var(--detail)" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="59" cy="27" r="1.3" fill="var(--base)"/>`),
 han:motif(`<path d="M38 28C26 32 22 40 19 47C23 46 25 44 28 42C19 52 16 61 17 67L24 62C17 71 17 82 20 88C34 82 46 84 62 94C60 79 51 69 52 57C58 60 64 62 70 60C74 59 76 57 76 54L72 53C70 56 66 55 64 53C61 51 60 48 61 45C68 45 73 49 78 51C83 53 88 50 88 45L91 40C92 37 90 35 87 34L76 28C73 23 71 17 65 14C60 11 54 11 49 14C46 8 41 4 36 4C37 10 38 16 38 20L32 12C30 17 31 24 33 28Z"/>
 <path d="M41 10C42 15 43 19 45 21L47 17C45 14 43 11 41 10Z" fill="var(--base)"/>
 <g fill="none" stroke="var(--base)" stroke-linecap="round"><path d="M35 33C27 41 26 46 25 53M34 43C25 57 26 65 24 72M35 53C29 68 32 75 29 80" stroke-width="1.7"/><path d="M46 39C39 56 45 73 53 83M61 22C67 26 67 33 73 35M65 48C69 52 74 53 80 51" stroke-width="1.3"/></g>
 <path d="M55 29C58 25 63 26 65 28L59 32Z" fill="var(--base)"/><path d="M83 38C79 37 78 41 80 43C83 44 85 40 83 38Z" fill="var(--base)"/>`)
};
