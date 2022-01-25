using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using WhatPass.Models;
using WhatPass.Providers;
using Microsoft.AspNet.Identity;

namespace WhatPass.Controllers
{
    [Authorize]
    [RoutePrefix("api/Credentials")]
    public class CredentialsController : ApiController
    {
        private ApplicationDbContext db = new ApplicationDbContext();

        // GET: api/Credentials
        //public IQueryable<Credentials> GetCredentials()
        //{
        //    return db.Credentials;
        //}

        // GET: api/Credentials
        [ResponseType(typeof(Credentials))]
        public IHttpActionResult GetCredentials(ReqCredentialsModel requestData)
        {
            var userId = RequestContext.Principal.Identity.GetIntUserId();
            Credentials credentialsEnc = db.Credentials.First(p => p.OwnerId == userId && p.Url == requestData.url);
            if (credentialsEnc == null)
            {
                return NotFound();
            }

            ResCredentialsDecModel credentialsDec = new ResCredentialsDecModel()
            {
                Url = credentialsEnc.Url,
                Username = credentialsEnc.Username,
                Password = Rijndael.DecryptStringFromBytes(credentialsEnc.Password, Encoding.ASCII.GetBytes(requestData.key))
            };

            return Ok(credentialsDec);
        }

        // PUT: api/Credentials/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutCredentials(int id, Credentials credentials)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != credentials.Id)
            {
                return BadRequest();
            }

            db.Entry(credentials).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CredentialsExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/Credentials
        [ResponseType(typeof(ReqCredentialsDecModel))]
        public async Task<IHttpActionResult> PostCredentials(ReqCredentialsDecModel credentials)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var credentialsEnc = new Credentials() {
                Url = credentials.Url,
                Username = credentials.Username,
                Password = Rijndael.EncryptStringToBytes(credentials.Password, Encoding.ASCII.GetBytes(credentials.Key)),
                OwnerId = RequestContext.Principal.Identity.GetIntUserId()
            };

            db.Credentials.Add(credentialsEnc);
            await db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = credentialsEnc.Id }, credentialsEnc);
        }

        // DELETE: api/Credentials/5
        [ResponseType(typeof(Credentials))]
        public async Task<IHttpActionResult> DeleteCredentials(int id)
        {
            Credentials credentials = await db.Credentials.FindAsync(id);
            if (credentials == null)
            {
                return NotFound();
            }

            db.Credentials.Remove(credentials);
            await db.SaveChangesAsync();

            return Ok(credentials);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool CredentialsExists(int id)
        {
            return db.Credentials.Count(e => e.Id == id) > 0;
        }
    }
}