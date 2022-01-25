using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Web;

namespace Microsoft.AspNet.Identity
{
    public static class IdentityExtensions
    {
        public static int GetIntUserId(this IIdentity identity)
        {
            int result = -1;
            int.TryParse(identity.GetUserId(), out result);
            return result;
        }
    }
}