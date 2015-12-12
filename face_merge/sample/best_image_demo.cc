// Copyright (c) 2012, Tencent Inc. All rights reserved.
// Author: Yongjian Wu <littlekenwu@tencent.com>
//         Enxun Wei <nxunwei@tencent.com>
//
// Demo code for best image project.

#include <stdio.h>

#include <string>
#include <iostream>
#include <vector>

#include "../include/best_image_errors.h"
#include "../include/best_image.h"

using namespace std;

bool GetImageContent(const std::string& filepath, std::string& data);
void WriteImageFile(std::string data, std::string filepath);

int main()
{
    unsigned int custom_id = 1099999999;

    /// ����������ļ�·��
    string src_file_path = "./test_data/src_data.jpg";
    string dst_file_path = "./test_data/dst_data.jpg";

    /// ��׼ʹ������
    /// ע: BestImage�������������ͼƬ��ֻ���ظ�ִ�в���2��3��4��5
    ///     ������BestImage����ʱ����ʹ��SetCustom������������custom_id����Բ�ͬҵ��ı��ڲ�����

    /// 1.��������
    best_image::BestImage image(custom_id);
    string src_data;
    if (!GetImageContent(src_file_path, src_data))
    {
        cout << "fail when reading image file" << endl;
        return -1;
    }

    /// 2.��string�н�ͼƬ����BestImage����
    best_image::ErrorCode error_code = image.Load(src_data);
    if (error_code != best_image::SUCCESS)
    {
        cout << "error on Load" << endl;
        return error_code;
    }
    /// 3-1.ִ��Resize����/������������
    error_code = image.Resize(800, 800);
    if (error_code != best_image::SUCCESS)
    {
        cout << "error on Resize" << endl;
        return error_code;
    }
    /// 3-2.�������
    std::vector<best_image::BestImage::FaceCandidate> faces;
    error_code = image.FindFace(faces);
    cout << "facecount " << faces.size() << endl;
    for (unsigned int i=0; i<faces.size(); ++i) {
        best_image::BestImage::FaceCandidate& fc = faces.at(i);
        cout << "face rect " << fc.left << fc.right << fc.top << fc.bottom << endl;
        cout << "face confidence " << fc.confidence << endl;
    }
    /// 4.ѹ�������棨���ڲ�֧��ѹ���ĸ�ʽ��ֱ�ӱ��棩
    string dst_data;
    int quality = 85; //����Ϊ-1��ʹ��ԭͼQuality��Ϊ�ο�ֵ,���������ʹ��ԭϵͳ��ʹ�õĹ̶�ֵ����85
    //����ʱ�����Ҫָ���ض���ʽ����Ҫ��ȫ��д����JPEG
    error_code = image.CompressAndSave(dst_data, "", quality);
    if (error_code != best_image::SUCCESS)
    {
        cout << "error on CompressAndSave" << endl;
        return error_code;
    }
    WriteImageFile(dst_data, dst_file_path);

    return 0;
}

bool GetImageContent(const std::string& filepath, std::string& data)
{
    bool ret = false;
    data = "";

    FILE* fp = fopen(filepath.c_str(), "rb");

    if (fp != NULL)
    {
        fseek(fp, 0, SEEK_END);
        int len = ftell(fp);
        rewind(fp);

        char* buffer = new char[len + 1];
        fread(buffer, 1, len, fp);
        buffer[len] = '\0';
        data.resize(len);
        copy(buffer, buffer + len, data.begin());

        delete[] buffer;
        buffer = NULL;

        fclose(fp);
        fp = NULL;

        ret = true;
    }

    return ret;
}

void WriteImageFile(std::string data, std::string filepath)
{
    FILE * fp = fopen(filepath.c_str(), "wb");

    if (fp == NULL)
    {
        return;
    }

    fwrite(data.c_str(), 1, data.size(), fp);
    fclose(fp);
}


