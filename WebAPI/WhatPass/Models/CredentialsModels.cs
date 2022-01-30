using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WhatPass.Models
{
    public class ReqCredentialsDecModel
    {
        public string Url { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string Key { get; set; }
    }
    public class ResCredentialsDecModel
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class Credentials
    {
        public int Id { get; set; }
        public string Url { get; set; }
        public string Username { get; set; }
        public byte[] Password { get; set; }
        virtual public int OwnerId { get; set; }
        //public DateTime DateAdded { get; set; }
    }
    public class ReqCredentialsModel
    {
        public string Url { get; set; }
        public string Key { get; set; }
    }
    public class CredentialsStatusModel
    {
        public bool IsSaved { get; set; }
        public bool IsDifferent { get; set; }
    }
}