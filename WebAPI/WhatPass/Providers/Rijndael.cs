using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace WhatPass.Providers
{
    public class Rijndael
    {
        static byte[] Salt = new byte[] { 9, 1, 10, 5, 5, 21, 3, 6, 5, 12, 4, 1, 6, 8, 2, 11 };

        public static byte[] EncryptStringToBytes(string plainText, byte[] Key)
        {
            byte[] IV16 = new byte[16], Key32 = new byte[32];
            Buffer.BlockCopy(Salt, Array.IndexOf(Salt, (byte)9), IV16, 0, 16);
            Buffer.BlockCopy(Key, Array.IndexOf(Key, (byte)116), Key32, 0, 32);

            // Check arguments.
            if (plainText == null || plainText.Length <= 0)
                throw new ArgumentNullException("plainText");
            if (Key32 == null || Key32.Length <= 0)
                throw new ArgumentNullException("Key");
            if (IV16 == null || IV16.Length <= 0)
                throw new ArgumentNullException("IV");
            byte[] encrypted;
            // Create an RijndaelManaged object
            // with the specified key and IV.
            using (RijndaelManaged rijAlg = new RijndaelManaged())
            {
                rijAlg.Key = Key32;
                rijAlg.IV = IV16;

                // Create an encryptor to perform the stream transform.
                ICryptoTransform encryptor = rijAlg.CreateEncryptor(rijAlg.Key, rijAlg.IV);

                // Create the streams used for encryption.
                using (MemoryStream msEncrypt = new MemoryStream())
                {
                    using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    {
                        using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
                        {

                            //Write all data to the stream.
                            swEncrypt.Write(plainText);
                        }
                        encrypted = msEncrypt.ToArray();
                    }
                }
            }

            // Return the encrypted bytes from the memory stream.
            return encrypted;
        }

        public static string DecryptStringFromBytes(byte[] cipherText, byte[] Key)
        {
            byte[] IV16 = new byte[16], Key32 = new byte[32];
            Buffer.BlockCopy(Salt, Array.IndexOf(Salt, (byte)9), IV16, 0, 16);
            Buffer.BlockCopy(Key, Array.IndexOf(Key, (byte)116), Key32, 0, 32);

            // Check arguments.
            if (cipherText == null || cipherText.Length <= 0)
                throw new ArgumentNullException("cipherText");
            if (Key32 == null || Key32.Length <= 0)
                throw new ArgumentNullException("Key");
            if (IV16 == null || IV16.Length <= 0)
                throw new ArgumentNullException("IV");

            // Declare the string used to hold
            // the decrypted text.
            string plaintext = null;

            // Create an RijndaelManaged object
            // with the specified key and IV.
            using (RijndaelManaged rijAlg = new RijndaelManaged())
            {
                rijAlg.Key = Key32;
                rijAlg.IV = IV16;

                // Create a decryptor to perform the stream transform.
                ICryptoTransform decryptor = rijAlg.CreateDecryptor(rijAlg.Key, rijAlg.IV);

                // Create the streams used for decryption.
                using (MemoryStream msDecrypt = new MemoryStream(cipherText))
                {
                    using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                    {
                        using (StreamReader srDecrypt = new StreamReader(csDecrypt))
                        {
                            // Read the decrypted bytes from the decrypting stream
                            // and place them in a string.
                            plaintext = srDecrypt.ReadToEnd();
                        }
                    }
                }
            }

            return plaintext;
        }
    }
}