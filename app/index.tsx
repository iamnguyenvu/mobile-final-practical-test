import { getDatabase } from "@/db";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

type Contact = {
  id: number;
  name: string;
  phone: string;
  email: string;
  favorite: number;
  created_at: number;
};

export default function Index() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (Platform.OS !== 'web') {
      loadContacts();
    }
  }, []);

  const loadContacts = async () => {
    try {
      const db = getDatabase();
      const result = await db.getAllAsync<Contact>('SELECT * FROM contacts ORDER BY created_at DESC');
      setContacts(result);
    } catch (error) {
      console.error('Lỗi tải contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    if (email.length === 0) return true;
    return email.includes('@');
  };

  const handleAddContact = async () => {
    if (!newContact.name.trim()) {
      Alert.alert('Lỗi', 'Tên không được để trống');
      return;
    }

    if (newContact.email && !validateEmail(newContact.email)) {
      Alert.alert('Lỗi', 'Email phải chứa ký tự @');
      return;
    }

    try {
      const db = getDatabase();
      const now = Date.now();
      await db.runAsync(
        'INSERT INTO contacts (name, phone, email, favorite, created_at) VALUES (?, ?, ?, ?, ?)',
        [newContact.name.trim(), newContact.phone.trim(), newContact.email.trim(), 0, now]
      );
      
      setModalVisible(false);
      setNewContact({ name: '', phone: '', email: '' });
      loadContacts();
      Alert.alert('Thành công', 'Đã thêm liên hệ mới');
    } catch (error) {
      console.error('Lỗi thêm contact:', error);
      Alert.alert('Lỗi', 'Không thể thêm liên hệ');
    }
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <View style={styles.contactItem}>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>
          {item.name} {item.favorite === 1 && '⭐'}
        </Text>
        <Text style={styles.contactPhone}>{item.phone}</Text>
        {item.email && <Text style={styles.contactEmail}>{item.email}</Text>}
      </View>
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text>SQLite không khả dụng trên web</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Danh bạ</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <Text>Đang tải...</Text>
      ) : contacts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Chưa có liên hệ nào.</Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderContact}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm liên hệ mới</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Tên *"
              value={newContact.name}
              onChangeText={(text) => setNewContact({ ...newContact, name: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              value={newContact.phone}
              onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={newContact.email}
              onChangeText={(text) => setNewContact({ ...newContact, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewContact({ name: '', phone: '', email: '' });
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddContact}
              >
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  contactItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
