import React, { useState, useEffect } from 'react';
import { Carousel, Button } from 'antd';
import { LeftOutlined, RightOutlined, PlayCircleOutlined } from '@ant-design/icons';
import './BannerCarousel.css';

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonAction: () => void;
  isHot?: boolean;
}

const BannerCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselRef, setCarouselRef] = useState<any>(null);

  const bannerItems: BannerItem[] = [
    {
      id: '1',
      title: 'CHÀO MỪNG ĐẾN PG88',
      subtitle: 'Khuyến Mãi Chào Mừng',
      description: 'Nhận ngay 100% tiền thưởng lần nạp đầu tiên lên đến 5,000,000₫',
      image: '/assets/banners/welcome-banner.jpg',
      buttonText: 'Nhận Thưởng Ngay',
      buttonAction: () => console.log('Welcome bonus clicked'),
      isHot: true
    },
    {
      id: '2',
      title: 'JACKPOT KHỦNG',
      subtitle: 'Giải Thưởng Lớn',
      description: 'Cơ hội trúng Jackpot hàng tỷ đồng với các game slot hấp dẫn',
      image: '/assets/banners/jackpot-banner.jpg',
      buttonText: 'Chơi Ngay',
      buttonAction: () => console.log('Jackpot clicked'),
      isHot: true
    },
    {
      id: '3',
      title: 'LIVE CASINO',
      subtitle: 'Trải Nghiệm Thực Tế',
      description: 'Chơi với dealer thật, phát trực tiếp 24/7 từ studio chuyên nghiệp',
      image: '/assets/banners/live-casino-banner.jpg',
      buttonText: 'Vào Sòng Bài',
      buttonAction: () => console.log('Live casino clicked')
    },
    {
      id: '4',
      title: 'BẮN CÁ ĐẠI DƯƠNG',
      subtitle: 'Săn Cá Khổng Lồ',
      description: 'Trải nghiệm game bắn cá 3D với đồ họa tuyệt đẹp và tỷ lệ thưởng cao',
      image: '/assets/banners/fishing-banner.jpg',
      buttonText: 'Bắt Đầu Săn',
      buttonAction: () => console.log('Fishing clicked')
    },
    {
      id: '5',
      title: 'VIP REWARDS',
      subtitle: 'Đặc Quyền VIP',
      description: 'Hưởng ưu đãi độc quyền, cashback hàng tuần và quà tặng giá trị',
      image: '/assets/banners/vip-banner.jpg',
      buttonText: 'Trở Thành VIP',
      buttonAction: () => console.log('VIP clicked')
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      if (carouselRef) {
        carouselRef.next();
      }
    }, 5000); // Auto-slide every 5 seconds

    return () => clearInterval(timer);
  }, [carouselRef]);

  const handlePrevious = () => {
    if (carouselRef) {
      carouselRef.prev();
    }
  };

  const handleNext = () => {
    if (carouselRef) {
      carouselRef.next();
    }
  };

  const handleDotClick = (index: number) => {
    if (carouselRef) {
      carouselRef.goTo(index);
    }
  };

  return (
    <div className="banner-carousel">
      <div className="banner-carousel-container">
        <Carousel
          ref={setCarouselRef}
          autoplay={false} // We handle autoplay manually
          dots={false}
          infinite={true}
          speed={800}
          fade={true}
          beforeChange={(_current, next) => setCurrentSlide(next)}
          className="banner-carousel-slider"
        >
          {bannerItems.map((item) => (
            <div key={item.id} className="banner-slide">
              <div className="banner-slide-content">
                <div className="banner-background">
                  <div className="banner-gradient-overlay"></div>
                  <div className="banner-pattern-overlay"></div>
                </div>
                
                <div className="banner-content">
                  <div className="banner-text-section">
                    {item.isHot && (
                      <div className="banner-hot-badge">
                        <span className="hot-text">HOT</span>
                        <div className="hot-flame"></div>
                      </div>
                    )}
                    
                    <h1 className="banner-title">
                      {item.title}
                    </h1>
                    
                    <h2 className="banner-subtitle">
                      {item.subtitle}
                    </h2>
                    
                    <p className="banner-description">
                      {item.description}
                    </p>
                    
                    <Button
                      type="primary"
                      size="large"
                      icon={<PlayCircleOutlined />}
                      className="banner-cta-button"
                      onClick={item.buttonAction}
                    >
                      {item.buttonText}
                    </Button>
                  </div>
                  
                  <div className="banner-image-section">
                    <div className="banner-image-container">
                      <div className="banner-glow-effect"></div>
                      <div className="banner-floating-elements">
                        <div className="floating-coin coin-1">₫</div>
                        <div className="floating-coin coin-2">₫</div>
                        <div className="floating-coin coin-3">₫</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Carousel>

        {/* Navigation Arrows */}
        <button className="banner-nav-arrow banner-nav-prev" onClick={handlePrevious}>
          <LeftOutlined />
        </button>
        <button className="banner-nav-arrow banner-nav-next" onClick={handleNext}>
          <RightOutlined />
        </button>

        {/* Custom Dots */}
        <div className="banner-dots">
          {bannerItems.map((_, index) => (
            <button
              key={index}
              className={`banner-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
            >
              <span className="dot-inner"></span>
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="banner-progress">
          <div 
            className="banner-progress-bar"
            style={{ 
              width: `${((currentSlide + 1) / bannerItems.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default BannerCarousel;