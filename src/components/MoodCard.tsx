import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { formatDate } from '../utils/formatDate';
import LottieView from 'lottie-react-native';
// Map mood icon names to Lottie animation JSON files
const moodLottieAnimations: Record<string, any> = {
  happy: require('../assets/lottie/happy.json'),
  sad: require('../assets/lottie/sad.json'),
  angry: require('../assets/lottie/angry.json'),
  surprised: require('../assets/lottie/surprised.json'),
  // Add more mappings as needed
};


// Simple privacy indicator using Lottie (optional, fallback to emoji)
const PrivacyIndicator: React.FC<{ isPrivate: boolean }> = ({ isPrivate }) => {
  return (
    <View style={styles.privacyContainer}>
      <Text style={{ fontSize: 18 }}>
        {isPrivate ? '🙈' : '👁️'}
      </Text>
    </View>
  );
};


interface MoodCardProps {
  mood: {
    id: string;
    icon: string;
    description: string;
    reason?: string;
    date: string; // ISO string
    isPrivate: boolean;
    createdByMe: boolean;
  };
  onEdit?: () => void;
  onDelete?: () => void;
}


// Privacy indicator component
// (removed duplicate PrivacyIndicator declaration)
// Icon component to display mood icon with appropriate styling
const MoodIcon: React.FC<{ iconName: string }> = ({ iconName }) => {
  const animationSource = moodLottieAnimations[iconName] || moodLottieAnimations['happy'];
  return (
    <View style={styles.iconContainer}>
      <LottieView
        source={animationSource}
        autoPlay
        loop
        style={{ width: 36, height: 36 }}
      />
    </View>
  );
};
// Action buttons component
const ActionButtons: React.FC<{
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ onEdit, onDelete }) => {
  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
        {/* <Icon name="pencil" size={18} color="#007AFF" /> */}
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
        {/* <Icon name="delete" size={18} color="#FF3B30" /> */}
      </TouchableOpacity>
    </View>
  );
};

const MoodCard: React.FC<MoodCardProps> = ({ mood, onEdit, onDelete }) => {
  const formattedDate = formatDate(mood.date);

  return (
    <View style={styles.container}>
      {/* Privacy indicator */}
      <PrivacyIndicator isPrivate={mood.isPrivate} />

      <View style={styles.contentContainer}>
        {/* Top row with icon and description */}
        <View style={styles.topRow}>
          <MoodIcon iconName={mood.icon} />
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>{mood.description}</Text>
          </View>
        </View>

        {/* Mood details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          {mood.reason && <Text style={styles.reasonText}>{mood.reason}</Text>}
        </View>
      </View>

      {/* Action buttons if the mood was created by the user */}
      {mood.createdByMe && (
        <ActionButtons onEdit={onEdit} onDelete={onDelete} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  contentContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  descriptionContainer: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  detailsContainer: {
    marginTop: 8,
    paddingLeft: 52, // Align with the text after the icon
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  privacyContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
});

export default MoodCard;