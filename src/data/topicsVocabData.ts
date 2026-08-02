import { TopicWord } from '../types';

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const VOCAB_CATEGORIES: CategoryInfo[] = [
  { id: 'jobs', name: 'Nghề nghiệp (Jobs & Occupations)', icon: '💼', color: 'bg-[#3EC6F0]', description: '31+ từ vựng về công việc, ngành nghề' },
  { id: 'fruits', name: 'Trái cây (Fruits)', icon: '🍎', color: 'bg-[#FF8C7A]', description: '23+ từ vựng các loại quả tươi ngon' },
  { id: 'family', name: 'Gia đình (Family)', icon: '👨‍👩‍👧‍👦', color: 'bg-[#7ED957]', description: '22+ xưng hô và thành viên gia đình' },
  { id: 'animals', name: 'Động vật (Animals)', icon: '🦁', color: 'bg-[#FFCF44]', description: '61+ con vật sống động và hoang dã' },
  { id: 'colors', name: 'Màu sắc (Colors)', icon: '🎨', color: 'bg-[#A855F7]', description: '20+ gam màu sặc sỡ và tinh tế' },
  { id: 'body', name: 'Bộ phận cơ thể (Body Parts)', icon: '🧍', color: 'bg-[#EC4899]', description: '33+ bộ phận từ đầu đến chân' },
  { id: 'school', name: 'Trường học (School)', icon: '🏫', color: 'bg-[#3B82F6]', description: '20+ thuật ngữ trường học & thi cử' },
  { id: 'personality', name: 'Tính cách (Personality)', icon: '🧠', color: 'bg-[#10B981]', description: '90+ tính từ miêu tả tính cách con người' },
  { id: 'school_things', name: 'Đồ dùng học tập (School Things)', icon: '✏️', color: 'bg-[#F59E0B]', description: '18+ dụng cụ học tập hàng ngày' },
  { id: 'nature', name: 'Thiên nhiên (Nature)', icon: '🌲', color: 'bg-[#14B8A6]', description: '39+ danh từ thiên nhiên & địa hình' },
  { id: 'entertainment', name: 'Giải trí (Entertainment)', icon: '🎭', color: 'bg-[#8B5CF6]', description: '36+ hoạt động & sở thích giải trí' },
  { id: 'house', name: 'Nhà cửa & Nội thất (House)', icon: '🏠', color: 'bg-[#EF4444]', description: '61+ đồ dùng & phòng ở gia đình' },
  { id: 'vegetables', name: 'Rau củ quả (Vegetables)', icon: '🥦', color: 'bg-[#22C55E]', description: '29+ loại rau củ gia vị quen thuộc' },
  { id: 'food_drinks', name: 'Đồ ăn & Đồ uống (Food & Drinks)', icon: '🍔', color: 'bg-[#F97316]', description: '43+ món ăn & thức uống thơm ngon' },
  { id: 'actions', name: 'Hoạt động & Hành động (Actions)', icon: '🏃', color: 'bg-[#06B6D4]', description: '46+ động từ hành động thể chất' },
  { id: 'clothes', name: 'Trang phục & Phụ kiện (Clothes)', icon: '👗', color: 'bg-[#E11D48]', description: '50+ quần áo & đồ dùng thời trang' },
  { id: 'emotions', name: 'Cảm xúc & Tâm trạng (Emotions)', icon: '😍', color: 'bg-[#F43F5E]', description: '92+ trạng thái cảm xúc con người' },
  { id: 'cooking', name: 'Nấu ăn & Bếp núc (Cooking)', icon: '🍳', color: 'bg-[#D97706]', description: '42+ từ vựng chế biến món ăn' },
  { id: 'transport', name: 'Phương tiện giao thông (Transport)', icon: '🚗', color: 'bg-[#2563EB]', description: '25+ phương tiện đi lại trên không & biển' },
  { id: 'travel', name: 'Du lịch & Khám phá (Travel)', icon: '✈️', color: 'bg-[#0EA5E9]', description: '22+ chuyến đi & thủ tục hành lý' },
  { id: 'subjects', name: 'Môn học (School Subjects)', icon: '📐', color: 'bg-[#6366F1]', description: '21+ môn học phổ thông & đại học' },
  { id: 'shapes', name: 'Hình khối (Shapes)', icon: '🔺', color: 'bg-[#84CC16]', description: '16+ hình học phẳng & không gian' },
  { id: 'sports', name: 'Thể thao (Sports)', icon: '⚽', color: 'bg-[#059669]', description: '21+ bộ môn thể thao vận động' },
  { id: 'time', name: 'Thời gian & Lịch (Time & Calendar)', icon: '⏰', color: 'bg-[#EAB308]', description: '35+ mốc thời gian, thứ, tháng, mùa' },
  { id: 'plants', name: 'Cây & Hoa (Plants & Flowers)', icon: '🌻', color: 'bg-[#10B981]', description: '33+ loài hoa, cây cối & cấu tạo cây' },
  { id: 'weather', name: 'Thời tiết & Khí hậu (Weather)', icon: '🌤️', color: 'bg-[#38BDF8]', description: '40+ hiện tượng thời tiết & nhiệt độ' },
];

export const RAW_VOCAB_LIST: TopicWord[] = [
  // 1. Jobs
  { id: '1', word: 'accountant', phonetic: '/əˈkaʊntənt/', partOfSpeech: 'n', vietnamese: 'kế toán', exampleEn: 'An accountant manages the company financial records.', exampleVi: 'Một kế toán quản lý hồ sơ tài chính của công ty.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '2', word: 'actor', phonetic: '/ˈæktə(r)/', partOfSpeech: 'n', vietnamese: 'diễn viên nam', exampleEn: 'The actor played a heroic knight in the movie.', exampleVi: 'Diễn viên nam đóng vai một hiệp sĩ anh hùng trong phim.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '3', word: 'actress', phonetic: '/ˈæktrəs/', partOfSpeech: 'n', vietnamese: 'diễn viên nữ', exampleEn: 'The actress won an award for best performance.', exampleVi: 'Diễn viên nữ đã giành giải thưởng cho màn trình diễn xuất sắc nhất.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '4', word: 'artist', phonetic: '/ˈɑːtɪst/', partOfSpeech: 'n', vietnamese: 'nghệ sĩ, họa sĩ', exampleEn: 'She is a talented artist who paints landscapes.', exampleVi: 'Cô ấy là một nghệ sĩ tài năng vẽ tranh cảnh vật.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '5', word: 'astronaut', phonetic: '/ˈæstrənɔːt/', partOfSpeech: 'n', vietnamese: 'phi hành gia', exampleEn: 'Astronauts travel into outer space in rockets.', exampleVi: 'Phi hành gia bay vào vũ trụ bằng tên lửa.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '6', word: 'baker', phonetic: '/ˈbeɪkə(r)/', partOfSpeech: 'n', vietnamese: 'thợ làm bánh', exampleEn: 'The baker bakes fresh bread every morning.', exampleVi: 'Thợ làm bánh nướng bánh mì tươi mỗi sáng.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '7', word: 'butcher', phonetic: '/ˈbʊtʃə(r)/', partOfSpeech: 'n', vietnamese: 'người bán thịt', exampleEn: 'We buy fresh beef from the local butcher.', exampleVi: 'Chúng tôi mua thịt bò tươi từ người bán thịt địa phương.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '8', word: 'cashier', phonetic: '/kæˈʃɪə(r)/', partOfSpeech: 'n', vietnamese: 'nhân viên thu ngân', exampleEn: 'The cashier scanned my items at the supermarket.', exampleVi: 'Nhân viên thu ngân đã quét các món đồ của tôi tại siêu thị.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '9', word: 'chef', phonetic: '/ʃef/', partOfSpeech: 'n', vietnamese: 'đầu bếp trưởng', exampleEn: 'The chef prepared an exquisite 5-course meal.', exampleVi: 'Đầu bếp đã chuẩn bị một bữa ăn 5 món tuyệt vời.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '10', word: 'comedian', phonetic: '/kəˈmiːdiən/', partOfSpeech: 'n', vietnamese: 'diễn viên hài', exampleEn: 'The comedian made the whole audience laugh loudly.', exampleVi: 'Diễn viên hài đã khiến toàn bộ khán giả bật cười lớn.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '11', word: 'delivery man', phonetic: '/dɪˈlɪvəri mæn/', partOfSpeech: 'n', vietnamese: 'nhân viên giao hàng', exampleEn: 'The delivery man brought the package to my door.', exampleVi: 'Nhân viên giao hàng đã mang bưu kiện đến tận cửa nhà tôi.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '12', word: 'doctor', phonetic: '/ˈdɒktə(r)/', partOfSpeech: 'n', vietnamese: 'bác sĩ', exampleEn: 'The doctor examined the sick child carefully.', exampleVi: 'Bác sĩ đã khám cho đứa trẻ bị bệnh một cách cẩn thận.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '13', word: 'entrepreneur', phonetic: '/ˌɒntrəprəˈnɜː(r)/', partOfSpeech: 'n', vietnamese: 'doanh nhân khởi nghiệp', exampleEn: 'He is an entrepreneur who started his own tech company.', exampleVi: 'Anh ấy là một doanh nhân khởi nghiệp công ty công nghệ riêng.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '14', word: 'engineer', phonetic: '/ˌendʒɪˈnɪə(r)/', partOfSpeech: 'n', vietnamese: 'kỹ sư', exampleEn: 'The civil engineer designed a strong bridge.', exampleVi: 'Kỹ sư xây dựng đã thiết kế một cây cầu vững chắc.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '15', word: 'factory worker', phonetic: '/ˈfæktri ˈwɜːkə(r)/', partOfSpeech: 'n', vietnamese: 'công nhân nhà máy', exampleEn: 'Factory workers operate assembly lines efficiently.', exampleVi: 'Công nhân nhà máy vận hành dây chuyền lắp ráp hiệu quả.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '16', word: 'office worker', phonetic: '/ˈɒfɪs ˈwɜːkə(r)/', partOfSpeech: 'n', vietnamese: 'nhân viên văn phòng', exampleEn: 'An office worker uses computers for daily tasks.', exampleVi: 'Một nhân viên văn phòng dùng máy tính cho công việc hàng ngày.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '17', word: 'florist', phonetic: '/ˈflɒrɪst/', partOfSpeech: 'n', vietnamese: 'người bán hoa', exampleEn: 'The florist arranged a beautiful bouquet of roses.', exampleVi: 'Người bán hoa đã cắm một bó hoa hồng đẹp mắt.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '18', word: 'hairdresser', phonetic: '/ˈheədresə(r)/', partOfSpeech: 'n', vietnamese: 'thợ cắt tóc', exampleEn: 'My hairdresser gave me a trendy new haircut.', exampleVi: 'Thợ cắt tóc đã cắt cho tôi một kiểu tóc mới hợp thời trang.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '19', word: 'lawyer', phonetic: '/ˈlɔːjə(r)/', partOfSpeech: 'n', vietnamese: 'luật sư', exampleEn: 'The lawyer advised her client during the court trial.', exampleVi: 'Luật sư đã tư vấn cho thân chủ trong phiên tòa.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '20', word: 'musician', phonetic: '/mjuˈzɪʃn/', partOfSpeech: 'n', vietnamese: 'nhạc sĩ, nhạc công', exampleEn: 'The musician plays the piano with intense emotion.', exampleVi: 'Nhạc công chơi đàn piano với cảm xúc dạt dào.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '21', word: 'pharmacist', phonetic: '/ˈfɑːməsɪst/', partOfSpeech: 'n', vietnamese: 'dược sĩ', exampleEn: 'The pharmacist explained how to take the medicine correctly.', exampleVi: 'Dược sĩ giải thích cách uống thuốc đúng liều lượng.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '22', word: 'plumber', phonetic: '/ˈplʌmə(r)/', partOfSpeech: 'n', vietnamese: 'thợ sửa ống nước', exampleEn: 'We called a plumber to fix the leaking pipe.', exampleVi: 'Chúng tôi gọi thợ sửa ống nước đến chữa đường ống bị rò rỉ.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '23', word: 'politician', phonetic: '/ˌpɒləˈtɪʃn/', partOfSpeech: 'n', vietnamese: 'chính trị gia', exampleEn: 'The politician gave a speech about public healthcare.', exampleVi: 'Chính trị gia đã phát biểu về y tế công cộng.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '24', word: 'programmer', phonetic: '/ˈprəʊɡræmə(r)/', partOfSpeech: 'n', vietnamese: 'lập trình viên', exampleEn: 'The software programmer wrote clean code for the app.', exampleVi: 'Lập trình viên phần mềm đã viết mã sạch cho ứng dụng.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '25', word: 'real estate agent', phonetic: '/ˌrɪəl ɪˈsteɪt ˈeɪdʒənt/', partOfSpeech: 'n', vietnamese: 'nhân viên môi giới bất động sản', exampleEn: 'The real estate agent showed us three cozy apartments.', exampleVi: 'Nhân viên môi giới bất động sản đã dẫn chúng tôi xem 3 căn hộ ấm cúng.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '26', word: 'tailor', phonetic: '/ˈteɪlə(r)/', partOfSpeech: 'n', vietnamese: 'thợ may', exampleEn: 'The tailor fitted the suit perfectly for the wedding.', exampleVi: 'Thợ may đã sửa bộ com-lê vừa vặn hoàn hảo cho lễ cưới.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '27', word: 'taxi driver', phonetic: '/ˈtæksi ˌdraɪvə(r)/', partOfSpeech: 'n', vietnamese: 'tài xế taxi', exampleEn: 'The taxi driver knows all the shortcuts in town.', exampleVi: 'Tài xế taxi biết tất cả đường tắt trong thành phố.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '28', word: 'teacher', phonetic: '/ˈtiːtʃə(r)/', partOfSpeech: 'n', vietnamese: 'giáo viên', exampleEn: 'Ms Lý is a dedicated English teacher.', exampleVi: 'Cô Lý là một giáo viên tiếng Anh tận tụy.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '29', word: 'receptionist', phonetic: '/rɪˈsepʃənɪst/', partOfSpeech: 'n', vietnamese: 'nhân viên lễ tân', exampleEn: 'The receptionist greeted us with a warm smile.', exampleVi: 'Nhân viên lễ tân chào đón chúng tôi bằng nụ cười ấm áp.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '30', word: 'singer', phonetic: '/ˈsɪŋə(r)/', partOfSpeech: 'n', vietnamese: 'ca sĩ', exampleEn: 'The pop singer sang her hit song on stage.', exampleVi: 'Ca sĩ nhạc pop đã hát bài hát hit của mình trên sân khấu.', category: 'Nghề nghiệp', categoryId: 'jobs' },
  { id: '31', word: 'firefighter', phonetic: '/ˈfaɪəfaɪtə(r)/', partOfSpeech: 'n', vietnamese: 'lính cứu hỏa', exampleEn: 'Brave firefighters put out the fire rapidly.', exampleVi: 'Những người lính cứu hỏa dũng cảm đã dập tắt đám cháy nhanh chóng.', category: 'Nghề nghiệp', categoryId: 'jobs' },

  // 2. Fruits
  { id: '32', word: 'apple', phonetic: '/ˈæp.əl/', partOfSpeech: 'n', vietnamese: 'quả táo', exampleEn: 'An apple a day keeps the doctor away.', exampleVi: 'Mỗi ngày một quả táo giúp nâng cao sức khỏe.', category: 'Trái cây', categoryId: 'fruits' },
  { id: '33', word: 'banana', phonetic: '/bəˈnɑː.nə/', partOfSpeech: 'n', vietnamese: 'quả chuối', exampleEn: 'Monkeys love eating ripe yellow bananas.', exampleVi: 'Khỉ rất thích ăn chuối chín vàng.', category: 'Trái cây', categoryId: 'fruits' },
  { id: '34', word: 'pear', phonetic: '/peə(r)/', partOfSpeech: 'n', vietnamese: 'quả lê', exampleEn: 'The juicy pear tasted sweet and refreshing.', exampleVi: 'Quả lê mọng nước có vị ngọt và thanh mát.', category: 'Trái cây', categoryId: 'fruits' },
  { id: '35', word: 'grape', phonetic: '/ɡreɪp/', partOfSpeech: 'n', vietnamese: 'quả nho', exampleEn: 'Purple grapes are used to make delicious juice.', exampleVi: 'Nho tím được dùng để làm nước ép thơm ngon.', category: 'Trái cây', categoryId: 'fruits' },
  { id: '36', word: 'peach', phonetic: '/piːtʃ/', partOfSpeech: 'n', vietnamese: 'quả đào', exampleEn: 'Fresh peaches have soft fuzzy skin.', exampleVi: 'Những quả đào tươi có lớp vỏ mịn như nhung.', category: 'Trái cây', categoryId: 'fruits' },
  { id: '37', word: 'orange', phonetic: '/ˈɒr.ɪndʒ/', partOfSpeech: 'n', vietnamese: 'quả cam', exampleEn: 'Drinking orange juice provides lots of Vitamin C.', exampleVi: 'Uống nước cam cung cấp nhiều Vitamin C.', category: 'Trái cây', categoryId: 'fruits' },
  { id: '38', word: 'mango', phonetic: '/ˈmæŋ.ɡəʊ/', partOfSpeech: 'n', vietnamese: 'quả xoài', exampleEn: 'Sweet mangoes are popular in tropical countries.', exampleVi: 'Xoài ngọt rất phổ biến ở các nước nhiệt đới.', category: 'Trái cây', categoryId: 'fruits' },
  { id: '39', word: 'coconut', phonetic: '/ˈkəʊ.kə.nʌt/', partOfSpeech: 'n', vietnamese: 'quả dừa', exampleEn: 'Coconut water is cool and hydrating on hot days.', exampleVi: 'Nước dừa mát lành giúp giải khát vào những ngày nóng.', category: 'Trái cây', categoryId: 'fruits' },
  { id: '40', word: 'pineapple', phonetic: '/ˈpaɪnˌæp.əl/', partOfSpeech: 'n', vietnamese: 'quả dứa, quả thơm', exampleEn: 'Pineapple pie has a sweet and tangy flavor.', exampleVi: 'Bánh dứa có hương vị chua ngọt đậm đà.', category: 'Trái cây', categoryId: 'fruits' },
  { id: '41', word: 'watermelon', phonetic: '/ˈwɔː.təˌmel.ən/', partOfSpeech: 'n', vietnamese: 'dưa hấu', exampleEn: 'Chilled watermelon is the best summer snack.', exampleVi: 'Dưa hấu ướp lạnh là món ăn vặt mùa hè tuyệt nhất.', category: 'Trái cây', categoryId: 'fruits' },
  { id: '42', word: 'durian', phonetic: '/ˈdʒʊə.ri.ən/', partOfSpeech: 'n', vietnamese: 'sầu riêng', exampleEn: 'Durian is known as the king of tropical fruits.', exampleVi: 'Sầu riêng được mệnh danh là vua của các loại quả nhiệt đới.', category: 'Trái cây', categoryId: 'fruits' },
  { id: '43', word: 'lychee', phonetic: '/ˈlaɪ.tʃiː/', partOfSpeech: 'n', vietnamese: 'quả vải', exampleEn: 'Lychees are sweet and fragrant summer fruits.', exampleVi: 'Vải là loại quả mùa hè ngọt mọng và thơm phức.', category: 'Trái cây', categoryId: 'fruits' },
  { id: '44', word: 'guava', phonetic: '/ˈɡwɑː.və/', partOfSpeech: 'n', vietnamese: 'quả ổi', exampleEn: 'Guava juice is rich in vitamins and minerals.', exampleVi: 'Nước ép ổi giàu vitamin và khoáng chất.', category: 'Trái cây', categoryId: 'fruits' },
  { id: '45', word: 'starfruit', phonetic: '/ˈstɑː.fruːt/', partOfSpeech: 'n', vietnamese: 'quả khế', exampleEn: 'Starfruit looks like a star when sliced horizontally.', exampleVi: 'Quả khế trông giống hình ngôi sao khi cắt ngang.', category: 'Trái cây', categoryId: 'fruits' },
  { id: '46', word: 'apricot', phonetic: '/ˈeɪ.prɪ.kɒt/', partOfSpeech: 'n', vietnamese: 'quả mơ', exampleEn: 'Dried apricots are tasty and high in fiber.', exampleVi: 'Mơ sấy khô rất ngon và giàu chất xơ.', category: 'Trái cây', categoryId: 'fruits' },
  { id: '47', word: 'jackfruit', phonetic: '/ˈdʒæk.fruːt/', partOfSpeech: 'n', vietnamese: 'quả mít', exampleEn: 'Jackfruit has a distinctive sweet aroma.', exampleVi: 'Quả mít có mùi thơm ngọt đặc trưng.', category: 'Trái cây', categoryId: 'fruits' },
  { id: '48', word: 'avocado', phonetic: '/ˌæv.əˈkɑː.dəʊ/', partOfSpeech: 'n', vietnamese: 'quả bơ', exampleEn: 'Avocado smoothy is creamy and healthy.', exampleVi: 'Sinh tố bơ béo ngậy và rất tốt cho sức khỏe.', category: 'Trái cây', categoryId: 'fruits' },
  { id: '49', word: 'papaya', phonetic: '/pəˈpaɪ.ə/', partOfSpeech: 'n', vietnamese: 'quả đu đủ', exampleEn: 'Ripe papaya is good for digestion.', exampleVi: 'Đu đủ chín rất tốt cho hệ tiêu hóa.', category: 'Trái cây', categoryId: 'fruits' },
  { id: '50', word: 'plum', phonetic: '/plʌm/', partOfSpeech: 'n', vietnamese: 'quả mận', exampleEn: 'She picked fresh red plums from the orchard.', exampleVi: 'Cô ấy hái những quả mận đỏ tươi từ trong vườn.', category: 'Trái cây', categoryId: 'fruits' },

  // 3. Family
  { id: '55', word: 'family', phonetic: '/ˈfæm.əl.i/', partOfSpeech: 'n', vietnamese: 'gia đình', exampleEn: 'My family gathers together every Sunday evening.', exampleVi: 'Gia đình tôi sum họp cùng nhau vào mỗi tối Chủ Nhật.', category: 'Gia đình', categoryId: 'family' },
  { id: '56', word: 'mother', phonetic: '/ˈmʌð.ə(r)/', partOfSpeech: 'n', vietnamese: 'mẹ', exampleEn: 'My mother cooks delicious meals every day.', exampleVi: 'Mẹ tôi nấu những bữa ăn thơm ngon mỗi ngày.', category: 'Gia đình', categoryId: 'family' },
  { id: '57', word: 'father', phonetic: '/ˈfɑː.ðə(r)/', partOfSpeech: 'n', vietnamese: 'bố, cha', exampleEn: 'My father taught me how to ride a bicycle.', exampleVi: 'Bố tôi đã dạy tôi cách đi xe đạp.', category: 'Gia đình', categoryId: 'family' },
  { id: '58', word: 'parents', phonetic: '/ˈpeə.rənts/', partOfSpeech: 'n', vietnamese: 'bố mẹ, phụ huynh', exampleEn: 'Parents always want the best for their children.', exampleVi: 'Cha mẹ luôn muốn những điều tốt đẹp nhất cho con cái.', category: 'Gia đình', categoryId: 'family' },
  { id: '59', word: 'daughter', phonetic: '/ˈdɔː.tə(r)/', partOfSpeech: 'n', vietnamese: 'con gái', exampleEn: 'Their daughter loves playing the violin.', exampleVi: 'Con gái của họ thích chơi đàn vi-ô-lông.', category: 'Gia đình', categoryId: 'family' },
  { id: '60', word: 'son', phonetic: '/sʌn/', partOfSpeech: 'n', vietnamese: 'con trai', exampleEn: 'His son wants to become a pilot in the future.', exampleVi: 'Con trai ông ấy muốn trở thành phi công trong tương lai.', category: 'Gia đình', categoryId: 'family' },
  { id: '61', word: 'sibling', phonetic: '/ˈsɪb.lɪŋ/', partOfSpeech: 'n', vietnamese: 'anh chị em ruột', exampleEn: 'Do you have any siblings?', exampleVi: 'Bạn có anh chị em ruột nào không?', category: 'Gia đình', categoryId: 'family' },
  { id: '62', word: 'sister', phonetic: '/ˈsɪs.tə(r)/', partOfSpeech: 'n', vietnamese: 'chị, em gái', exampleEn: 'My elder sister helps me with homework.', exampleVi: 'Chị gái tôi giúp tôi làm bài tập về nhà.', category: 'Gia đình', categoryId: 'family' },
  { id: '63', word: 'brother', phonetic: '/ˈbrʌð.ə(r)/', partOfSpeech: 'n', vietnamese: 'anh, em trai', exampleEn: 'My younger brother plays football every afternoon.', exampleVi: 'Em trai tôi chơi bóng đá mỗi chiều.', category: 'Gia đình', categoryId: 'family' },
  { id: '64', word: 'grandmother', phonetic: '/ˈɡrænˌmʌð.ə(r)/', partOfSpeech: 'n', vietnamese: 'bà nội, bà ngoại', exampleEn: 'Grandmother tells us fascinating bedtime stories.', exampleVi: 'Bà kể cho chúng tôi nghe những câu chuyện cổ tích hấp dẫn trước khi ngủ.', category: 'Gia đình', categoryId: 'family' },
  { id: '65', word: 'grandfather', phonetic: '/ˈɡrænˌfɑː.ðə(r)/', partOfSpeech: 'n', vietnamese: 'ông nội, ông ngoại', exampleEn: 'Grandfather enjoys doing morning exercises in the park.', exampleVi: 'Ông thích tập thể dục buổi sáng ở công viên.', category: 'Gia đình', categoryId: 'family' },
  { id: '66', word: 'relative', phonetic: '/ˈrel.ə.tɪv/', partOfSpeech: 'n', vietnamese: 'họ hàng', exampleEn: 'All our relatives visited us during Tet holiday.', exampleVi: 'Tất cả họ hàng đã đến thăm chúng tôi trong dịp Tết.', category: 'Gia đình', categoryId: 'family' },
  { id: '67', word: 'aunt', phonetic: '/ɑːnt/', partOfSpeech: 'n', vietnamese: 'cô, dì, bác gái', exampleEn: 'My aunt sent me a lovely birthday present.', exampleVi: 'Dì tôi gửi tặng tôi một món quà sinh nhật đáng yêu.', category: 'Gia đình', categoryId: 'family' },
  { id: '68', word: 'uncle', phonetic: '/ˈʌŋ.kəl/', partOfSpeech: 'n', vietnamese: 'chú, bác, cậu', exampleEn: 'Uncle John is a doctor at the city hospital.', exampleVi: 'Chú John là bác sĩ tại bệnh viện thành phố.', category: 'Gia đình', categoryId: 'family' },
  { id: '69', word: 'cousin', phonetic: '/ˈkʌz.ən/', partOfSpeech: 'n', vietnamese: 'anh chị em họ', exampleEn: 'I spent the summer holiday with my cousins.', exampleVi: 'Tôi đã trải qua kỳ nghỉ hè cùng các anh chị em họ.', category: 'Gia đình', categoryId: 'family' },
  { id: '70', word: 'nephew', phonetic: '/ˈnef.juː/', partOfSpeech: 'n', vietnamese: 'cháu trai (con của anh/chị/em)', exampleEn: 'My nephew is learning how to draw cartoons.', exampleVi: 'Cháu trai tôi đang học cách vẽ hoạt hình.', category: 'Gia đình', categoryId: 'family' },
  { id: '71', word: 'niece', phonetic: '/niːs/', partOfSpeech: 'n', vietnamese: 'cháu gái (con của anh/chị/em)', exampleEn: 'Her niece celebrated her 5th birthday yesterday.', exampleVi: 'Cháu gái cô ấy vừa đón sinh nhật 5 tuổi hôm qua.', category: 'Gia đình', categoryId: 'family' },
  { id: '72', word: 'wife', phonetic: '/waɪf/', partOfSpeech: 'n', vietnamese: 'vợ', exampleEn: 'He loves his wife and prepares coffee for her.', exampleVi: 'Anh ấy yêu vợ và pha cà phê cho cô ấy.', category: 'Gia đình', categoryId: 'family' },
  { id: '73', word: 'husband', phonetic: '/ˈhʌz.bənd/', partOfSpeech: 'n', vietnamese: 'chồng', exampleEn: 'Her husband works as an architect.', exampleVi: 'Chồng cô ấy làm kiến trúc sư.', category: 'Gia đình', categoryId: 'family' },

  // 4. Animals
  { id: '77', word: 'mouse', phonetic: '/maʊs/', partOfSpeech: 'n', vietnamese: 'con chuột', exampleEn: 'The tiny mouse ran into its small hole.', exampleVi: 'Con chuột bé xíu chạy chui vào cái lỗ nhỏ.', category: 'Động vật', categoryId: 'animals' },
  { id: '78', word: 'cat', phonetic: '/kæt/', partOfSpeech: 'n', vietnamese: 'con mèo', exampleEn: 'The fluffy cat likes sleeping in the warm sun.', exampleVi: 'Con mèo xù thích nằm ngủ dưới nắng ấm.', category: 'Động vật', categoryId: 'animals' },
  { id: '79', word: 'dog', phonetic: '/dɒɡ/', partOfSpeech: 'n', vietnamese: 'con chó', exampleEn: 'A loyal dog guards the house safely.', exampleVi: 'Chú chó trung thành trông nhà rất an toàn.', category: 'Động vật', categoryId: 'animals' },
  { id: '80', word: 'kitten', phonetic: '/ˈkɪt.ən/', partOfSpeech: 'n', vietnamese: 'mèo con', exampleEn: 'The playful kitten chased a ball of yarn.', exampleVi: 'Chú mèo con hiếu động đuổi theo cuộn len.', category: 'Động vật', categoryId: 'animals' },
  { id: '81', word: 'puppy', phonetic: '/ˈpʌp.i/', partOfSpeech: 'n', vietnamese: 'chó con', exampleEn: 'Our puppy barks happily when we come home.', exampleVi: 'Chú chó con của chúng tôi sủa mừng vui vẻ khi chúng tôi về nhà.', category: 'Động vật', categoryId: 'animals' },
  { id: '82', word: 'lion', phonetic: '/ˈlaɪ.ən/', partOfSpeech: 'n', vietnamese: 'sư tử', exampleEn: 'The lion roars loudly in the African savanna.', exampleVi: 'Con sư tử gầm vang trên thảo nguyên Châu Phi.', category: 'Động vật', categoryId: 'animals' },
  { id: '83', word: 'tiger', phonetic: '/ˈtaɪ.ɡə(r)/', partOfSpeech: 'n', vietnamese: 'con hổ', exampleEn: 'The tiger has distinctive black and orange stripes.', exampleVi: 'Con hổ có những vằn đen cam đặc trưng.', category: 'Động vật', categoryId: 'animals' },
  { id: '84', word: 'elephant', phonetic: '/ˈel.ɪ.fənt/', partOfSpeech: 'n', vietnamese: 'con voi', exampleEn: 'An elephant uses its long trunk to spray water.', exampleVi: 'Con voi dùng chiếc vòi dài để phun nước.', category: 'Động vật', categoryId: 'animals' },
  { id: '85', word: 'dolphin', phonetic: '/ˈdɒl.fɪn/', partOfSpeech: 'n', vietnamese: 'cá heo', exampleEn: 'Friendly dolphins jumped above the ocean waves.', exampleVi: 'Những con cá heo thân thiện nhảy cao trên sóng biển.', category: 'Động vật', categoryId: 'animals' },
  { id: '86', word: 'penguin', phonetic: '/ˈpeŋ.ɡwɪn/', partOfSpeech: 'n', vietnamese: 'chim cánh cụt', exampleEn: 'Penguins waddle on ice in Antarctica.', exampleVi: 'Chim cánh cụt đi lạch bạch trên băng ở Nam Cực.', category: 'Động vật', categoryId: 'animals' },
  { id: '87', word: 'eagle', phonetic: '/ˈiː.ɡəl/', partOfSpeech: 'n', vietnamese: 'chim đại bàng', exampleEn: 'The eagle soared high up in the blue sky.', exampleVi: 'Con đại bàng bay lượn cao trên bầu trời xanh.', category: 'Động vật', categoryId: 'animals' },
  { id: '88', word: 'rabbit', phonetic: '/ˈræb.ɪt/', partOfSpeech: 'n', vietnamese: 'con thỏ', exampleEn: 'The cute rabbit nibbled on a fresh carrot.', exampleVi: 'Con thỏ dễ thương gặm một củ cà rốt tươi.', category: 'Động vật', categoryId: 'animals' },

  // 5. Personality
  { id: '213', word: 'active', phonetic: '/ˈæk.tɪv/', partOfSpeech: 'adj', vietnamese: 'năng động, lanh lợi', exampleEn: 'She is an active student who participates in all sports.', exampleVi: 'Cô ấy là một học sinh năng động tham gia tất cả môn thể thao.', category: 'Tính cách', categoryId: 'personality' },
  { id: '218', word: 'brave', phonetic: '/breɪv/', partOfSpeech: 'adj', vietnamese: 'dũng cảm', exampleEn: 'The brave girl rescued the kitten from the tree.', exampleVi: 'Cô gái dũng cảm đã giải cứu chú mèo con khỏi cái cây.', category: 'Tính cách', categoryId: 'personality' },
  { id: '219', word: 'careful', phonetic: '/ˈkeə.fəl/', partOfSpeech: 'adj', vietnamese: 'cẩn thận', exampleEn: 'Be careful when crossing the busy street.', exampleVi: 'Hãy cẩn thận khi sang con phố đông đúc.', category: 'Tính cách', categoryId: 'personality' },
  { id: '228', word: 'dependable', phonetic: '/dɪˈpen.də.bəl/', partOfSpeech: 'adj', vietnamese: 'đáng tin cậy', exampleEn: 'He is a dependable friend who always helps.', exampleVi: 'Anh ấy là người bạn đáng tin cậy luôn giúp đỡ người khác.', category: 'Tính cách', categoryId: 'personality' },
  { id: '231', word: 'diligent', phonetic: '/ˈdɪl.ɪ.dʒənt/', partOfSpeech: 'adj', vietnamese: 'siêng năng, chăm chỉ', exampleEn: 'Diligent students achieve high examination scores.', exampleVi: 'Những học sinh siêng năng sẽ đạt điểm số cao trong kỳ thi.', category: 'Tính cách', categoryId: 'personality' },
  { id: '241', word: 'hard-working', phonetic: '/ˌhɑːdˈwɜː.kɪŋ/', partOfSpeech: 'adj', vietnamese: 'chăm chỉ, cần cù', exampleEn: 'My father is a very hard-working man.', exampleVi: 'Cha tôi là một người đàn ông vô cùng chăm chỉ.', category: 'Tính cách', categoryId: 'personality' },
  { id: '243', word: 'honest', phonetic: '/ˈɒn.ɪst/', partOfSpeech: 'adj', vietnamese: 'trung thực, thật thà', exampleEn: 'An honest person always speaks the truth.', exampleVi: 'Một người trung thực luôn luôn nói sự thật.', category: 'Tính cách', categoryId: 'personality' },
  { id: '256', word: 'loyal', phonetic: '/ˈlɔɪ.əl/', partOfSpeech: 'adj', vietnamese: 'trung thành', exampleEn: 'Dogs are known as loyal companions.', exampleVi: 'Chó được biết đến là người bạn đồng hành trung thành.', category: 'Tính cách', categoryId: 'personality' },
  { id: '263', word: 'organized', phonetic: '/ˈɔː.ɡən.aɪzd/', partOfSpeech: 'adj', vietnamese: 'ngăn nắp, có tổ chức', exampleEn: 'She keeps her desk tidy and organized.', exampleVi: 'Cô ấy luôn giữ bàn học gọn gàng và ngăn nắp.', category: 'Tính cách', categoryId: 'personality' },

  // 6. School things
  { id: '303', word: 'pen', phonetic: '/pen/', partOfSpeech: 'n', vietnamese: 'bút mực, bút bi', exampleEn: 'I signed the document with a blue pen.', exampleVi: 'Tôi đã ký văn bản bằng một cây bút bi màu xanh.', category: 'Đồ dùng học tập', categoryId: 'school_things' },
  { id: '304', word: 'pencil', phonetic: '/ˈpen.səl/', partOfSpeech: 'n', vietnamese: 'bút chì', exampleEn: 'Draw a soft sketch using a graphite pencil.', exampleVi: 'Vẽ phác thảo bằng bút chì than.', category: 'Đồ dùng học tập', categoryId: 'school_things' },
  { id: '306', word: 'ruler', phonetic: '/ˈruː.lə(r)/', partOfSpeech: 'n', vietnamese: 'thước kẻ', exampleEn: 'Use a ruler to draw straight lines.', exampleVi: 'Hãy dùng thước kẻ để vẽ các đường thẳng.', category: 'Đồ dùng học tập', categoryId: 'school_things' },
  { id: '307', word: 'eraser', phonetic: '/ɪˈreɪ.zə(r)/', partOfSpeech: 'n', vietnamese: 'cục tẩy (gôm)', exampleEn: 'Erase the mistake with a clean rubber eraser.', exampleVi: 'Tẩy lỗi sai bằng một cục tẩy cao su sạch.', category: 'Đồ dùng học tập', categoryId: 'school_things' },
  { id: '309', word: 'book', phonetic: '/bʊk/', partOfSpeech: 'n', vietnamese: 'quyển sách', exampleEn: 'Reading books expands your knowledge.', exampleVi: 'Đọc sách giúp mở rộng tri thức của bạn.', category: 'Đồ dùng học tập', categoryId: 'school_things' },
  { id: '310', word: 'notebook', phonetic: '/ˈnəʊt.bʊk/', partOfSpeech: 'n', vietnamese: 'quyển vở ghi', exampleEn: 'Take neat notes in your English notebook.', exampleVi: 'Ghi chép gọn gàng vào cuốn vở tiếng Anh của bạn.', category: 'Đồ dùng học tập', categoryId: 'school_things' },

  // 7. Nature
  { id: '323', word: 'forest', phonetic: '/ˈfɒr.ɪst/', partOfSpeech: 'n', vietnamese: 'rừng cây', exampleEn: 'Birds sing sweetly in the green forest.', exampleVi: 'Chim hót líu lo ngọt ngào trong khu rừng xanh.', category: 'Thiên nhiên', categoryId: 'nature' },
  { id: '325', word: 'mountain', phonetic: '/ˈmaʊn.tɪn/', partOfSpeech: 'n', vietnamese: 'ngọn núi', exampleEn: 'They climbed to the peak of the mountain.', exampleVi: 'Họ đã leo lên tới đỉnh núi.', category: 'Thiên nhiên', categoryId: 'nature' },
  { id: '334', word: 'waterfall', phonetic: '/ˈwɔː.tə.fɔːl/', partOfSpeech: 'n', vietnamese: 'thác nước', exampleEn: 'Water cascades down the majestic waterfall.', exampleVi: 'Nước đổ xuống ngọn thác hùng vĩ.', category: 'Thiên nhiên', categoryId: 'nature' },
  { id: '346', word: 'river', phonetic: '/ˈrɪv.ə(r)/', partOfSpeech: 'n', vietnamese: 'dòng sông', exampleEn: 'Fishermen row boats along the calm river.', exampleVi: 'Người đánh cá chèo thuyền dọc theo dòng sông êm đềm.', category: 'Thiên nhiên', categoryId: 'nature' },
  { id: '353', word: 'beach', phonetic: '/biːtʃ/', partOfSpeech: 'n', vietnamese: 'bãi biển', exampleEn: 'Children built sandcastles on the sunny beach.', exampleVi: 'Trẻ em xây lâu đài cát trên bãi biển tràn ngập ánh nắng.', category: 'Thiên nhiên', categoryId: 'nature' },

  // 8. House
  { id: '400', word: 'living room', phonetic: '/ˈlɪv.ɪŋ ruːm/', partOfSpeech: 'n', vietnamese: 'phòng khách', exampleEn: 'Our family watches TV together in the living room.', exampleVi: 'Gia đình chúng tôi cùng xem tivi ở phòng khách.', category: 'Nhà cửa & Nội thất', categoryId: 'house' },
  { id: '402', word: 'kitchen', phonetic: '/ˈkɪtʃ.ən/', partOfSpeech: 'n', vietnamese: 'nhà bếp', exampleEn: 'The kitchen smells like warm soup.', exampleVi: 'Căn bếp thơm lừng mùi canh nóng.', category: 'Nhà cửa & Nội thất', categoryId: 'house' },
  { id: '403', word: 'bedroom', phonetic: '/ˈbed.ruːm/', partOfSpeech: 'n', vietnamese: 'phòng ngủ', exampleEn: 'My bedroom is cozy and quiet for resting.', exampleVi: 'Phòng ngủ của tôi ấm cúng và yên tĩnh để nghỉ ngơi.', category: 'Nhà cửa & Nội thất', categoryId: 'house' },

  // 9. Actions
  { id: '533', word: 'walk', phonetic: '/wɔːk/', partOfSpeech: 'v', vietnamese: 'đi bộ', exampleEn: 'I walk to school every morning with friends.', exampleVi: 'Tôi đi bộ đến trường mỗi sáng cùng bạn bè.', category: 'Hoạt động & Hành động', categoryId: 'actions' },
  { id: '535', word: 'run', phonetic: '/rʌn/', partOfSpeech: 'v', vietnamese: 'chạy', exampleEn: 'He can run fast in sports competitions.', exampleVi: 'Anh ấy có thể chạy rất nhanh trong các cuộc thi thể thao.', category: 'Hoạt động & Hành động', categoryId: 'actions' },
  { id: '537', word: 'jump', phonetic: '/dʒʌmp/', partOfSpeech: 'v', vietnamese: 'nhảy', exampleEn: 'The kids jump high on the trampoline.', exampleVi: 'Bọn trẻ nhảy cao trên thảm nhún.', category: 'Hoạt động & Hành động', categoryId: 'actions' },
  { id: '554', word: 'smile', phonetic: '/smaɪl/', partOfSpeech: 'v', vietnamese: 'mỉm cười', exampleEn: 'Always smile when greeting new people.', exampleVi: 'Hãy luôn mỉm cười khi chào hỏi những người mới.', category: 'Hoạt động & Hành động', categoryId: 'actions' },

  // 10. Emotions
  { id: '634', word: 'happy', phonetic: '/ˈhæp.i/', partOfSpeech: 'adj', vietnamese: 'vui vẻ, hạnh phúc', exampleEn: 'I feel very happy when I pass my English exam.', exampleVi: 'Tôi cảm thấy rất vui vẻ khi vượt qua kỳ thi tiếng Anh.', category: 'Cảm xúc & Tâm trạng', categoryId: 'emotions' },
  { id: '638', word: 'grateful', phonetic: '/ˈɡreɪt.fəl/', partOfSpeech: 'adj', vietnamese: 'biết ơn', exampleEn: 'Be grateful for the good things in your life.', exampleVi: 'Hãy biết ơn vì những điều tốt đẹp trong cuộc sống.', category: 'Cảm xúc & Tâm trạng', categoryId: 'emotions' },

  // 11. Weather
  { id: '947', word: 'weather', phonetic: '/ˈweð.ə(r)/', partOfSpeech: 'n', vietnamese: 'thời tiết', exampleEn: 'The weather today is warm and sunny.', exampleVi: 'Thời tiết hôm nay ấm áp và có nắng.', category: 'Thời tiết & Khí hậu', categoryId: 'weather' },
  { id: '954', word: 'sunny', phonetic: '/ˈsʌn.i/', partOfSpeech: 'adj', vietnamese: 'có nắng, tràn ngập ánh nắng', exampleEn: 'It is a beautiful sunny morning.', exampleVi: 'Đó là một buổi sáng đẹp trời ngập tràn ánh nắng.', category: 'Thời tiết & Khí hậu', categoryId: 'weather' },
  { id: '982', word: 'rainbow', phonetic: '/ˈreɪn.bəʊ/', partOfSpeech: 'n', vietnamese: 'cầu vồng', exampleEn: 'A colorful rainbow appeared in the sky after rain.', exampleVi: 'Chiếc cầu vồng rực rỡ xuất hiện trên bầu trời sau cơn mưa.', category: 'Thời tiết & Khí hậu', categoryId: 'weather' },
];
