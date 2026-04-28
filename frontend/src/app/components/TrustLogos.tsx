const trustedLogos = [
  {
    src: '/koi-assets/68be6fcbd14e6e6069406d35_capital-one-logo.svg',
    alt: 'capital one logo',
    className: 'trusted_logo-caopone',
  },
  {
    src: '/koi-assets/693fe764d6a3f58bd57e61dd_cambia_logo.webp',
    alt: 'Cambia Health Solutions logo.',
    className: 'trusted_logo is-large',
  },
  {
    src: '/koi-assets/68be6fcb4f2333b5b254be75_d05bc7f346f87d947743d9be7747d1f4_fhlbank-logo.avif',
    alt: 'fhl bank logo',
    className: 'trusted_logo is-large',
    width: 49.5,
  },
  {
    src: '/koi-assets/68be6fcbbe1aead243303ae7_jump-logo.png',
    alt: 'jump trading logo',
    className: 'trusted_logo',
    width: 66.5,
  },
  {
    src: '/koi-assets/68be6fcb6c658b3973b96d3b_fireblocks-logo.avif',
    alt: 'fireblocks logo',
    className: 'trusted_logo_fireblocks',
    width: 147.5,
  },
];

export function TrustLogos() {
  return (
    <section className="trusted-section">
      <div className="padding-global padding-section-small trusted">
        <div className="container-large">
          <div className="trusted_component">
            <div>The world's leading security teams use Saya</div>
            <div className="trusted_logos-wrapper">
              {trustedLogos.map((logo) => (
                <img
                  key={logo.src}
                  src={logo.src}
                  loading="lazy"
                  width={logo.width}
                  alt={logo.alt}
                  className={logo.className}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
