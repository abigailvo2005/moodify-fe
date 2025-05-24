import { useEffect, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native";
import { Dimensions } from "react-native";
import LottieView from "lottie-react-native";
import { CAROUSEL_ANIMATIONS } from "../constants";

const { width, height } = Dimensions.get("window");

// Carousel Component
export const AnimationCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % CAROUSEL_ANIMATIONS.length;
      setCurrentIndex(nextIndex);

      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, CAROUSEL_ANIMATIONS.length]);

  return (
    <View style={styles.carouselContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setCurrentIndex(newIndex);
        }}
      >
        
        {CAROUSEL_ANIMATIONS.map((animationSource: any, index: number) => (
          <View key={index} style={styles.carouselItem}>
            <LottieView
              source={animationSource}
              autoPlay
              loop
              style={styles.carouselAnimation}
            />
          </View>
        ))}
      </ScrollView>

      {/* Dots Indicator */}
      <View style={styles.dotsContainer}>
        {CAROUSEL_ANIMATIONS.map((_: any, index: number) => (
          <View
            key={index}
            style={[styles.dot, { opacity: index === currentIndex ? 1 : 0.3 }]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  carouselContainer: {
    height: height * 0.25,
    marginTop: 50,
  },
  carouselItem: {
    width: width,
    justifyContent: "center",
    alignItems: "center",
  },
  carouselAnimation: {
    width: width * 0.6,
    height: height * 0.2,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginHorizontal: 4,
  },
});