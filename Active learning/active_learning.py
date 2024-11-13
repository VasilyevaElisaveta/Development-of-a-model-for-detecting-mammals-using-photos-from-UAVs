'''
Загрузка изображений и разделение на датсеты
'''

source_dir = '/path/to/images' # указывайте ваш путь
prep_dirs(source_dir, 'my_dataset')

# заполняем тренировочную часть
train_img_path = os.path.join(source_dir, ds_name, 'images', 'train')
train_lab_path = os.path.join(source_dir, ds_name, 'labels', 'train')

for path in [d for d in sorted(os.listdir(source_dir)) if d.endswith('_val.json')]:
    path_json = os.path.join(source_dir, path)
    info = viaLabels(path_json)
    path_images = os.path.join(source_dir, os.path.dirname(path), info[0])
    out = via2yola(path_json, path_images, info[1])

    for txt in out:
        if create_empty or len(out[txt]) > 0:
            img_file = os.path.join(path_images, txt[:-4] + '.jpg')
            if os.path.exists(img_file):
                shutil.copy(img_file, os.path.join(train_img_path, txt[:-4] + '.jpg'))
                with open(os.path.join(train_lab_path, txt), 'w') as f:
                    f.write('\n'.join(out[txt]))

# заполняем валидационную часть
val_img_path = os.path.join(source_dir, ds_name, 'images', 'val')
val_lab_path = os.path.join(source_dir, ds_name, 'labels', 'val')

if input('Нажмите 1, если требуется создать валидационный набор на основе % тренировочного: '.format(val_prc)) == '1':
    train_set = os.listdir(train_img_path)
    random.shuffle(train_set)

    val_cnt = len(train_set) // val_prc
    val_set = train_set[:val_cnt]

    for vs in val_set:
        shutil.move(os.path.join(train_img_path, vs), os.path.join(val_img_path, vs))
        shutil.move(os.path.join(train_lab_path, vs[:-4] + '.txt'), os.path.join(val_lab_path, vs[:-4] + '.txt'))

ds_path = os.path.join(source_dir, ds_name)
# Создание конфигурации .yaml с описанием датасета
with open(ds_path + '.yaml', 'w') as f:
    f.write('train: {}\n'.format(ds_path + os.sep))
    f.write('val: {}\n\n'.format(ds_path + os.sep))
    f.write('nc: {}\n\n'.format(len(info[1].keys())))
    f.write('names: {}\n'.format(list(info[1].keys())))

'''
Обучение модели
'''
model = torch.hub.load('/path/to/yolov5_dir',
                       'custom',
                       path='/path/to/yolov5_dir/best_model.pt',
                       source='local') # поменяйте в зависимости от расположения у вас
'''
Предскажем разметку второго блока, а также преобразуем выход модели, чтобы можно было импортировать в VIA
Генерируем разметку
'''
labels = {model.names[i]: '' for i in range(len(model.names))}
batchsize = 16
for _, dirs, _ in os.walk(source_dir):
    for d in sorted(dirs):
        if d[0] == '.':
            continue
        try:
            yoloAnnotations = []
            tmp_path = os.path.join(source_dir, d)

            for _, _, files in os.walk(tmp_path):
                imgs = [i for i in files if i[-3:] in ('jpg', 'png', 'bmp')]
                break

            for n in tqdm(range(len(imgs) // batchsize + 1), desc=d):
                imgs_batch = imgs[n * batchsize: (n + 1) * batchsize]
                imgs_ = []
                for img in imgs_batch:
                    imgs_.append(Image.open(os.path.join(tmp_path, img)))
                if len(imgs_) > 0:
                    result = model(imgs_, size=640)
                    yoloAnnotations.extend(result.pandas().xyxy)

            fromYolaToVia(tmp_path, imgs, yoloAnnotations, labels, project_name='fromYolaToVia')
        except:
            print('error', os.path.join(source_dir, d), )
