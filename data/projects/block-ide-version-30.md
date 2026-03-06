---
emoji: 🧩
title: Block IDE - Version 3.0
headingUrl: https://photos.app.goo.gl/rLjp8tBGs6WNStA18
tldr: Major overhaul of Tynker's Block Editor
start: '2019'
client: Tynker
location: Mountain View, California · Remote 🌍
role: Lead Software Engineer
team: Me + Game Development Team (content upgrades)
platforms: Web
technologies:
  - Redux
  - Redux Saga
  - AngularJS
  - JavaScript
  - CSS
  - PHP
links:
  - label: Gallery
    url: https://photos.app.goo.gl/rLjp8tBGs6WNStA18
  - label: Block IDE
    url: https://www.tynker.com/ide/v3
  - label: Platformer - Retro Racer
    url: https://www.tynker.com/ide/v3?type=platformer-v2&p=61a931e66634692f2b3a4310&content=377a22b7-f08508e9-9e748b16-d429ccad-f5&cache=max&v=f08508e9-9e748b16-d429ccad-f5
  - label: Platformer - Outlast the Onslaught
    url: https://www.tynker.com/ide/v3?type=platformer-v2&p=61a9453f8bdab975987e36f2&content=377a22b7-f08508e9-9e748b16-d429ccad-f5&cache=max&v=f08508e9-9e748b16-d429ccad-f5
  - label: Platformer - Platform Peril
    url: https://www.tynker.com/ide/v3?type=platformer-v2&p=61a93e699a4c54146b14233c&content=377a22b7-f08508e9-9e748b16-d429ccad-f5&cache=max&v=f08508e9-9e748b16-d429ccad-f5
  - label: Physics Cannon
    url: https://www.tynker.com/ide/v3?type=diy&p=546eaeef84aafa3125000012&content=377a22b7-f08508e9-9e748b16-d429ccad-f5&cache=max&v=f08508e9-9e748b16-d429ccad-f5
  - label: Brick Breaker
    url: https://www.tynker.com/ide/v3?type=diy&p=563bf549af923168448b456b&content=377a22b7-f08508e9-9e748b16-d429ccad-f5&cache=max&v=f08508e9-9e748b16-d429ccad-f5
  - label: Candy Quest
    url: https://www.tynker.com/ide/v3?type=course&slug=activity:candy-quest&chapter=0&lesson=0
  - label: Barbie Pet Vet
    url: https://www.tynker.com/ide/v3?type=course&slug=activity:barbie-pet-vet&chapter=0&lesson=0
---

In six months, I rearchitected a significant portion of Tynker's Block Editor, the core of its educational platform, to address critical scalability and maintenance issues caused by years of rushed development under tight deadlines, which had left the legacy codebase cluttered with hardcoded elements and quick-fix hacks, making it difficult to scale and maintain.

I implemented a new architecture based on a custom-built extension framework, Redux for state management, and Redux Saga for handling side effects. This solution improved scalability and future-proofed the platform. The extension framework modularized functionality, enforced separation of concerns, and introduced a clear lifecycle with declarative dependency management, significantly reducing maintenance overhead and simplifying feature additions. Redux decoupled UI state from the UI, and alongside the extension framework and Redux Saga, it streamlined scaling and enabled new features to be introduced with minimal changes across modules.

Looking back, a stack using PHP (for legacy reasons) + React (particularly with the release of React 16.8) + EmotionJS + the Extension Framework would have been more efficient. React could have replaced AngularJS, simplifying state management and eliminating the need for Redux. While Redux Saga was powerful, its steep learning curve for new developers would have made simpler alternatives preferable.
