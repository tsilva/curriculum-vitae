export function ScrollRevealProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var o=new IntersectionObserver(function(e){e.forEach(function(n){if(n.isIntersecting){n.target.classList.add("visible");o.unobserve(n.target)}})},{threshold:0.1,rootMargin:"0px 0px -40px 0px"});new MutationObserver(function(){document.querySelectorAll(".reveal:not(.visible)").forEach(function(e){o.observe(e)})}).observe(document.body,{childList:true,subtree:true});document.querySelectorAll(".reveal").forEach(function(e){o.observe(e)})})()`,
        }}
      />
    </>
  );
}
