import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

const ContactPage = () => {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setSending(true);
    
    // Simulate sending a message
    setTimeout(() => {
      setSending(false);
      Alert.alert(
        'Message Sent',
        'Thank you for contacting us. We will get back to you as soon as possible.',
        [{ text: 'OK', onPress: () => {
          setName('');
          setEmail('');
          setMessage('');
        }}]
      );
    }, 1500);
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: colors.text }]}>Contact Support</Text>
      
      <View style={styles.contactInfoSection}>
        <View style={styles.contactItem}>
          <View style={styles.iconContainer}>
            <Feather name="mail" size={24} color="#4c669f" />
          </View>
          <View>
            <Text style={[styles.contactLabel, { color: colors.text }]}>Email</Text>
            <Text style={[styles.contactValue, { color: colors.text }]}>contact@prescriptionai.app</Text>
          </View>
        </View>
        
        <View style={styles.contactItem}>
          <View style={styles.iconContainer}>
            <Feather name="clock" size={24} color="#4c669f" />
          </View>
          <View>
            <Text style={[styles.contactLabel, { color: colors.text }]}>Support Hours</Text>
            <Text style={[styles.contactValue, { color: colors.text }]}>Monday-Friday: 9am - 5pm IST</Text>
          </View>
        </View>
        
        <View style={styles.contactItem}>
          <View style={styles.iconContainer}>
            <Feather name="message-circle" size={24} color="#4c669f" />
          </View>
          <View>
            <Text style={[styles.contactLabel, { color: colors.text }]}>Response Time</Text>
            <Text style={[styles.contactValue, { color: colors.text }]}>Within 24-48 hours</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.formSection}>
        <Text style={[styles.formTitle, { color: colors.text }]}>Send us a Message</Text>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Your Name</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Message</Text>
          <TextInput
            style={[styles.messageInput, { borderColor: colors.border, color: colors.text }]}
            value={message}
            onChangeText={setMessage}
            placeholder="How can we help you?"
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>
        
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={handleSend}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Feather name="send" size={18} color="#fff" style={styles.sendIcon} />
              <Text style={styles.sendButtonText}>Send Message</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.faqSection}>
        <Text style={[styles.faqTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
        
        <View style={styles.faqItem}>
          <Text style={[styles.faqQuestion, { color: colors.text }]}>How accurate is the prescription scanning?</Text>
          <Text style={[styles.faqAnswer, { color: colors.text }]}>
            Our AI technology provides a high level of accuracy, but we recommend always verifying all extracted information with your original prescription.
          </Text>
        </View>
        
        <View style={styles.faqItem}>
          <Text style={[styles.faqQuestion, { color: colors.text }]}>How do I purchase more scan credits?</Text>
          <Text style={[styles.faqAnswer, { color: colors.text }]}>
            You can purchase additional scan credits from the Subscription screen, which is accessible from your profile.
          </Text>
        </View>
        
        <View style={styles.faqItem}>
          <Text style={[styles.faqQuestion, { color: colors.text }]}>Is my prescription data secure?</Text>
          <Text style={[styles.faqAnswer, { color: colors.text }]}>
            Yes, we employ industry-standard encryption to protect your data both in transit and at rest. Your data is only accessible to you through your authenticated account.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  contactInfoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 102, 159, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  messageInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 16,
    minHeight: 120,
  },
  sendButton: {
    backgroundColor: '#4c669f',
    borderRadius: 8,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  sendIcon: {
    marginRight: 8,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  faqSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});

export default ContactPage; 