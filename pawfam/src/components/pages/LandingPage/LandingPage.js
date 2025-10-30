import React from 'react';
import './LandingPage.css';

const LandingPage = ({ onNavigate }) => {
  const sections = [
    {
      title: 'About PawFam🐾',
      content: 'PawFam🐾 is the premier home-away-from-home for your furry family members when life takes you away. We understand that even a short trip requires a safe, loving, and engaging place for your pet to stay.',
      image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZG9nJTIwY2F0fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600',
    },
    {
      title: 'Services',
      content: 'Our dedicated team provides personalized care in a comfortable environment, filled with playtime, cuddles, and all the comforts of home. We keep tails wagging and purrs going so you can truly enjoy your time off, worry-free. Trust us to be your pet’s second family, offering peace of mind and a vacation for them too. Because every pet deserves a five-star stay, even if it’s just for the weekend.',
      image: 'https://images.unsplash.com/photo-1719464454959-9cf304ef4774?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGV0JTIwY2FyZSUyMGNlbnRlcnN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=1000',
    },
    {
      title: 'Pet Accessories',
      content: 'Discover a wide range of pet accessories to keep your furry friends happy and healthy. From stylish collars and leashes to cozy beds and toys, we have everything you need to pamper your pet. Shop now and give your pet the best!',
      image: 'https://plus.unsplash.com/premium_photo-1661724637207-be0c86fa6269?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZG9nJTIwbGVhc2h8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=1000'
    },
    {
      title: 'Pet Adoption',
      content: 'Looking to add a new member to your family? Explore our adoption section, where we feature pets from local shelters and private owners looking for a forever home. Whether for a short duration or a lifetime commitment, you can find a companion that’s right for you.',
      image: 'https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGV0JTIwYWRvcHRpb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=1000',
    },
  ];

  return (
    <div className="landing-page">
      <main>
        <section className="hero-section">
          <h1 className="hero-title">Welcome to PawFam🐾</h1>
          <p className="hero-subtitle">Short Stay, Big Love❤️</p>
          <button onClick={() => onNavigate('signup')} className="hero-btn">Join the Family</button>
        </section>

        {sections.map((section, index) => (
          <section key={index} className={`content-section ${index % 2 === 0 ? 'odd-bg' : 'even-bg'}`}>
            <div className={`content-container ${index % 2 !== 0 ? 'reverse' : ''}`}>
              <div className="image-container">
                <img src={section.image} alt={section.title} className="content-image" />
              </div>
              <div className="text-container">
                <h2 className="content-title">{section.title}</h2>
                <p className="content-text">{section.content}</p>
              </div>
            </div>
          </section>
        ))}

        <footer className="landing-footer">
          <div className="container">
            <p className="footer-text">&copy; 2025 PawFam🐾. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;