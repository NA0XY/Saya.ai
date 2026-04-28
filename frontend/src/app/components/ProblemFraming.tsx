export function ProblemFraming() {
  const options = [
    { number: 1, label: 'Ignore the problem', image: '/koi-assets/68be50587b0ee00c1f7c0e5f_941aaa6f6aaa70cb1d951bb42a8b37f4_options_icon02.svg' },
    { number: 2, label: 'Hire full-time help', image: '/koi-assets/68be5058d35cafbd911b3733_575d02b797a7ef18ef22159b437c65ee_options_icon01.svg' },
    { number: 3, label: 'Check in constantly', image: '/koi-assets/68be5058d7a2b59d41a73e51_70536c9144618b3ccadd1727d1b79f36_options_icon03.svg' },
  ];

  return (
    <section className="options-section">
      <img src="/koi-assets/68aafb8145a4cc39cc2efb8b_190d7e9ffea6b2dcb1a9b1d01ab72a14_cloud-bottom.svg" loading="lazy" alt="" className="rain_clouds-top" />
      <div className="padding-global padding-section-medium is-top-large">
        <div className="container-large">
          <div className="options_component">
            <div className="section-heading">
              <h2>The Problem: Elder care fails on two deeply human levels</h2>
            </div>
            <div className="options_wrapper" style={{ flexDirection: 'column', gap: '2rem' }}>
              <p className="text-size-medium" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                Medical safety and emotional isolation. Families worry constantly — did my father take his medication? Is he eating the right foods? Is anyone talking to him today?
              </p>
              <p className="text-size-medium" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                Existing solutions are either cold, clinical pill-reminder apps that elderly users ignore, or generic chatbots with no memory, no medical context, and no real connection. And critically — almost none of them are built for India.
              </p>
            </div>
            <div className="text-align-center text-size-medium text-style-allcaps max-width-medium align-center" style={{ marginTop: '2rem' }}>
              Saya.ai was built because the gap between "alive" and "truly cared for" deserves a real Indian answer.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
